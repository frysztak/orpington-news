use std::time::Duration;

use reqwest::{
    header::{HeaderMap, USER_AGENT},
    Client,
};

pub fn create_http_client() -> Result<Client, reqwest::Error> {
    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, "Orpington News".parse().unwrap());

    return Client::builder()
        .timeout(Duration::from_secs(60))
        .default_headers(headers)
        .build();
}
