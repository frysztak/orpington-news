use actix_web::{error::InternalError, http::StatusCode, web, HttpResponse, HttpResponseBuilder};
use feed_rs::{model::Feed, parser};
use normalize_url_rs::{normalize_url, OptionsBuilder};
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use url::Url;

use crate::{
    authentication::UserId,
    routes::{error::JSONError, error_chain_fmt},
    session_state::ID,
    utils::url::is_url_relative,
};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyUrlBody {
    url: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyUrlResponse {
    feed_url: String,
    title: Option<String>,
    description: Option<String>,
}

#[tracing::instrument(skip(pool, user_id, body))]
pub async fn verify_url(
    pool: web::Data<PgPool>,
    web::Json(body): web::Json<VerifyUrlBody>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<VerifyUrlError>> {
    let user_id: ID = user_id.into();

    let url = normalize_url(
        body.url.to_string(),
        OptionsBuilder::default().build().unwrap(),
    )
    .map_err(Into::into)
    .map_err(VerifyUrlError::UnexpectedError)?;

    let extraction_result = extract_feed_url(&url).await;

    match extraction_result {
        Ok(ExtractFeedUrlSuccess::Ok(feed_url)) => {
            let url = normalize_url(feed_url, OptionsBuilder::default().build().unwrap())
                .map_err(Into::into)
                .map_err(VerifyUrlError::UnexpectedError)?;
            let feed = attempt_feed_parsing(pool.as_ref(), user_id, &url).await?;

            Ok(HttpResponse::Ok().json(VerifyUrlResponse {
                feed_url: url,
                description: feed.description.and_then(|t| Some(t.content)),
                title: feed.title.and_then(|t| Some(t.content)),
            }))
        }
        Ok(ExtractFeedUrlSuccess::IsXML) => {
            let feed = attempt_feed_parsing(pool.as_ref(), user_id, &url).await?;

            Ok(HttpResponse::Ok().json(VerifyUrlResponse {
                feed_url: url,
                description: feed.description.and_then(|t| Some(t.content)),
                title: feed.title.and_then(|t| Some(t.content)),
            }))
        }
        Err(err) => Err(VerifyUrlError::InvalidFeed(err.into()).into()),
    }
}

#[derive(thiserror::Error)]
pub enum VerifyUrlError {
    #[error("Duplicate feed URL.")]
    DuplicateFeedUrl(),
    #[error("Invalid RSS/Atom feed.")]
    InvalidFeed(#[source] anyhow::Error),
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for VerifyUrlError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl From<VerifyUrlError> for InternalError<VerifyUrlError> {
    fn from(error: VerifyUrlError) -> Self {
        let response = match &error {
            VerifyUrlError::DuplicateFeedUrl() => HttpResponseBuilder::new(StatusCode::IM_A_TEAPOT)
                .json(JSONError {
                    status_code: 418,
                    message: "Duplicate feed URL.".to_string(),
                }),
            VerifyUrlError::InvalidFeed(_) => HttpResponseBuilder::new(StatusCode::IM_A_TEAPOT)
                .json(JSONError {
                    status_code: 418,
                    message: "Invalid RSS/Atom feed.".to_string(),
                }),
            VerifyUrlError::UnexpectedError(err) => {
                HttpResponse::InternalServerError().json(JSONError {
                    status_code: 500,
                    message: err.to_string(),
                })
            }
        };
        InternalError::from_response(error, response)
    }
}

async fn attempt_feed_parsing(
    pool: &PgPool,
    user_id: ID,
    url: &str,
) -> Result<Feed, VerifyUrlError> {
    let collection = sqlx::query!(
        r#"
SELECT
  *
FROM
  collections
WHERE
  url = $1
  AND user_id = $2
    "#,
        url,
        user_id
    )
    .fetch_optional(pool)
    .await
    .map_err(Into::into)
    .map_err(VerifyUrlError::UnexpectedError)?;

    if let Some(_) = collection {
        return Err(VerifyUrlError::DuplicateFeedUrl().into());
    }

    let xml = reqwest::get(url)
        .await
        .map_err(Into::into)
        .map_err(VerifyUrlError::UnexpectedError)?
        .text()
        .await
        .map_err(Into::into)
        .map_err(VerifyUrlError::UnexpectedError)?;

    let feed = parser::parse(xml.as_bytes())
        .map_err(Into::into)
        .map_err(VerifyUrlError::InvalidFeed)?;

    Ok(feed)
}

#[allow(dead_code)]
enum ExtractFeedUrlSuccess {
    Ok(String),
    IsXML,
}

#[derive(thiserror::Error, Debug)]
#[allow(dead_code)]
enum ExtractFeedUrlError {
    #[error("Failed to fetch")]
    FailedToFetch(#[source] anyhow::Error),
    #[error("Unexpected content type")]
    UnknownContentType(String),
    #[error("Failed to extract RSS/Atom link")]
    FailedToExtract,
    #[error("Unexpected error")]
    UnexpectedError(#[source] anyhow::Error),
}

async fn extract_feed_url(url: &str) -> Result<ExtractFeedUrlSuccess, ExtractFeedUrlError> {
    let client = reqwest::Client::new();
    let head_response = client
        .head(url)
        .send()
        .await
        .map_err(Into::into)
        .map_err(ExtractFeedUrlError::FailedToFetch)?;

    let content_type = head_response
        .headers()
        .get("Content-Type")
        .ok_or("EMPTY")
        .map_err(Into::into)
        .map_err(ExtractFeedUrlError::UnknownContentType)?
        .to_str()
        .map_err(Into::into)
        .map_err(ExtractFeedUrlError::UnexpectedError)?;

    if content_type.contains("application/atom+xml")
        || content_type.contains("application/rss+xml")
        || content_type.contains("application/xml")
        || content_type.contains("text/xml")
    {
        return Ok(ExtractFeedUrlSuccess::IsXML);
    }

    if !content_type.contains("text/html") {
        return Err(ExtractFeedUrlError::UnknownContentType(
            content_type.to_string(),
        ));
    }

    let html = client
        .get(url)
        .send()
        .await
        .map_err(Into::into)
        .map_err(ExtractFeedUrlError::FailedToFetch)?
        .text()
        .await
        .map_err(Into::into)
        .map_err(ExtractFeedUrlError::UnexpectedError)?;

    let document = Html::parse_document(&html);
    let selector = Selector::parse(r#"html head link[type="application/rss+xml"], html head link[type="application/atom+xml"]"#).unwrap();
    if let Some(rss_link_el) = document.select(&selector).next() {
        if let Some(rss_link) = rss_link_el.value().attr("href") {
            let feed_url = match is_url_relative(rss_link) {
                true => {
                    let mut base_url = Url::parse(url)
                        .map_err(Into::into)
                        .map_err(ExtractFeedUrlError::UnexpectedError)?;
                    base_url.set_path(rss_link);
                    base_url.to_string()
                }
                false => rss_link.to_string(),
            };

            return Ok(ExtractFeedUrlSuccess::Ok(feed_url));
        }
    }

    Err(ExtractFeedUrlError::FailedToExtract)
}
