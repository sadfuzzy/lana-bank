fn main() {
    println!("{}", lava_core::public::graphql::schema(None).sdl().trim());
}
