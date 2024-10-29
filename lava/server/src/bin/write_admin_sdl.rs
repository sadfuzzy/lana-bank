fn main() {
    println!("{}", lava_server::admin::graphql::schema(None).sdl().trim());
}
