pub fn error_chain_fmt(
    e: &impl std::error::Error,
    f: &mut std::fmt::Formatter<'_>,
) -> std::fmt::Result {
    writeln!(f, "{}\n", e)?;
    let mut current = e.source();
    while let Some(cause) = current {
        writeln!(f, "Caused by:\n\t{}", cause)?;
        current = cause.source();
    }
    Ok(())
}

pub mod error;

pub mod auth;
pub use self::auth::auth;

pub mod collections;
pub use self::collections::collections;

pub mod preferences;
pub use self::preferences::preferences;

pub mod e2e;
pub use self::e2e::e2e;

pub mod spa;
pub use self::spa::spa;