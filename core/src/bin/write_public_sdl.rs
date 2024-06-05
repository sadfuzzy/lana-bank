fn main() {
    println!(
        "{}",
        lava_core::server::public::graphql::schema(None)
            .sdl()
            .trim()
    );
}
