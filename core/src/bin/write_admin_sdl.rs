fn main() {
    println!(
        "{}",
        lava_core::server::admin::graphql::schema(None).sdl().trim()
    );
}
