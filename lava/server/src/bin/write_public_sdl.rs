fn main() {
    println!(
        "{}",
        lava_server::public::graphql::schema(None).sdl().trim()
    );
}
