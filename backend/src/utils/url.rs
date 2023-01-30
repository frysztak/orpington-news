use regex::Regex;

pub fn is_url_absolute(url: &str) -> bool {
    // thank you https://github.com/sindresorhus/is-absolute-url/blob/3ab19cc2e599a03ea691bcb8a4c09fa3ebb5da4f/index.js#L3
    let absolute_url_regex = Regex::new(r"^[a-zA-Z][a-zA-Z\d+\-.]*?:").unwrap();
    absolute_url_regex.is_match(url)
}

pub fn is_url_relative(url: &str) -> bool {
    !is_url_absolute(url)
}
