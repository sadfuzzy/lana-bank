fn main() {
    println!(
        "{}",
        lava_core::graphql::schema(None)
            .sdl()
            .trim()
    );
}

