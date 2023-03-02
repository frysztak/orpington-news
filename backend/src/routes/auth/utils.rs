use data_url::DataUrl;

pub fn map_avatar(avatar_uri: Option<&String>) -> Option<Vec<u8>> {
    avatar_uri.and_then(|uri| {
        let url = DataUrl::process(uri).ok()?;
        let (body, _fragment) = url.decode_to_vec().ok()?;
        Some(body)
    })
}
