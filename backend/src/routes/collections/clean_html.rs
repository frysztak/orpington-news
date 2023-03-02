use std::error::Error;
use url::Url;

use lol_html::{element, html_content::Element, HtmlRewriter, Settings};

use crate::utils::url::is_url_relative;

fn fix_image_src(el: &mut Element, root_url: &str) -> Result<(), Box<dyn Error + Send + Sync>> {
    if let Some(src) = el.get_attribute("src") {
        let new_src = match is_url_relative(&src) {
            true => {
                let mut url = Url::parse(root_url)?;
                url.set_path(&src);
                url.to_string()
            }
            false => src,
        };
        el.set_attribute("src", &new_src)?;
    }

    Ok(())
}

fn fix_relative_href(el: &mut Element, root_url: &str) -> Result<(), Box<dyn Error + Send + Sync>> {
    if let Some(href) = el.get_attribute("href") {
        let new_href = match is_url_relative(&href) {
            true => {
                let mut url = Url::parse(root_url)?;
                url.set_path(&href);
                url.to_string()
            }
            false => href,
        };
        el.set_attribute("href", &new_href)?;
    }

    Ok(())
}

pub fn clean_html(html: &str, root_url: &str) -> Result<String, anyhow::Error> {
    let mut output = vec![];
    let mut rewriter = HtmlRewriter::new(
        Settings {
            element_content_handlers: vec![
                element!("img[src]", |el| { fix_image_src(el, root_url) }),
                element!("a[href]", |el| { fix_relative_href(el, root_url) }),
            ],
            ..Settings::default()
        },
        |c: &[u8]| output.extend_from_slice(c),
    );

    rewriter.write(html.as_bytes())?;
    rewriter.end()?;

    String::from_utf8(output).map_err(Into::into)
}

#[cfg(test)]
mod test {

    mod fix_image_src_mod {
        use crate::routes::collections::clean_html::clean_html;
        static ROOT_URL: &str = "https://example.com";

        #[test]
        fn does_nothing_for_html_without_img() {
            let input = "hello <strong>there</strong>";
            assert_eq!(input, clean_html(&input, ROOT_URL).unwrap());
        }

        #[test]
        fn does_nothing_for_absolute_url() {
            let input = r#"<img src="https://example.com/img.png">"#;
            assert_eq!(input, clean_html(&input, ROOT_URL).unwrap());
        }

        #[test]
        fn turns_relative_into_absolute_url() {
            let input = r#"<img src="/static/img.png">"#;
            let expected = format!(r#"<img src="{}/static/img.png">"#, ROOT_URL);
            assert_eq!(expected, clean_html(&input, ROOT_URL).unwrap());
        }
    }

    mod fix_relative_href_mod {
        use crate::routes::collections::clean_html::clean_html;
        static ROOT_URL: &str = "https://example.com";

        #[test]
        fn does_nothing_for_text() {
            let input = "hello <strong>there</strong>";
            assert_eq!(input, clean_html(&input, ROOT_URL).unwrap());
        }

        #[test]
        fn does_nothing_for_absolute_url() {
            let input = r#"<a href="https://example.com/img.png">link</a>"#;
            assert_eq!(input, clean_html(&input, ROOT_URL).unwrap());
        }

        #[test]
        fn turns_relative_into_absolute_url() {
            let input = r#"<a href="/img.png">link</a>"#;
            let expected = format!(r#"<a href="{}/img.png">link</a>"#, ROOT_URL);
            assert_eq!(expected, clean_html(&input, ROOT_URL).unwrap());
        }
    }
}
