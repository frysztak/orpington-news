use actix_web::dev::HttpServiceFactory;

mod spa_impl;

#[cfg(feature = "spa")]
pub fn spa() -> impl HttpServiceFactory {
    spa_impl::Spa::default()
        .index_file("./web/index.html")
        // .static_resources_mount("./web/")
        .static_resources_location("./web")
        .finish()
}

#[cfg(not(feature = "spa"))]
pub fn spa() -> impl HttpServiceFactory {
    actix_web::web::scope("")
}
