use actix_web::dev::HttpServiceFactory;

#[cfg(feature = "spa")]
pub fn spa() -> impl HttpServiceFactory {
    use actix_web_nextjs_spa::Spa;

    Spa::default()
        .index_file("./web/index.html")
        // .static_resources_mount("./web/")
        .static_resources_location("./web")
        .finish()
}

#[cfg(not(feature = "spa"))]
pub fn spa() -> impl HttpServiceFactory {
    actix_web::web::scope("")
}
