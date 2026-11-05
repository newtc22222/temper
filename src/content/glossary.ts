export const glossary: { term: string; body: string }[] = [
  {
    term: "Framework",
    body: "The crate that owns the socket and calls your functions. In this course that crate is Axum, and it is the only one.",
  },
  {
    term: "Handler",
    body: "An `async fn` Axum calls when a route matches. Its arguments are extractors. Its return value becomes the response. You do not implement the `Handler` trait yourself.",
  },
  {
    term: "Router",
    body: "The table of routes. `Router::new()` starts it. `.route` adds a path. `.with_state` stores the value handlers share. After `.with_state`, `axum::serve` can run it.",
  },
  {
    term: "Route",
    body: "A method, a path, and a handler. `POST /notes` and `GET /notes` share a path string and differ by method: `get(list_notes).post(create_note)`.",
  },
  {
    term: "Extractor",
    body: "A type that turns part of the request into an argument. `Path`, `Json`, and `State` are the ones this course uses. Extractors that do not read the body may sit in any order. `Json` reads the body, so it is last.",
  },
  {
    term: "Path",
    body: "The extractor for `{id}` segments in Axum 0.8. A single `Path<u64>` parses that segment into an integer you own. A segment that does not fit is 400, and the handler does not run.",
  },
  {
    term: "Json",
    body: "An extractor and a response. As an extractor it consumes the body and deserializes into a value you own. As a response, `Json(value)` serializes and sets `content-type: application/json`.",
  },
  {
    term: "Deserialize",
    body: "The serde trait `Json` and a struct-shaped `Path` require on the way in. `#[derive(Deserialize)]` is enough for a struct of fields you already understand. The serde dependency needs the `derive` feature.",
  },
  {
    term: "Serialize",
    body: "The serde trait a type needs before it can be returned as `Json<T>`. `#[derive(Serialize)]` on `Note` is what makes the list and the single note writable.",
  },
  {
    term: "State",
    body: "Shared data cloned into each handler call. `.with_state` requires `Clone`. `State<AppState>` is cheap because cloning the struct clones an `Arc`, not the `Vec`.",
  },
  {
    term: "Arc",
    body: "Shared ownership. Cloning it increments a count. It does not clone the `Vec` inside the mutex. That is the clone `State` performs.",
  },
  {
    term: "Mutex",
    body: "One guard at a time. `lock` borrows the list until the guard drops. This course uses `std::sync::Mutex` and does not `.await` while the guard is alive.",
  },
  {
    term: "Rejection",
    body: "The `Err` side of an extractor. `JsonRejection` is how a bad body fails. `PathRejection` is how a bad segment fails. Both are `Result`s, not panics.",
  },
  {
    term: "IntoResponse",
    body: "The bound on a handler's return type. Status codes, strings, `Json<T>`, tuples of those, and `Result` of those implement it. A bare `Note` does not.",
  },
  {
    term: "Bound",
    body: "A requirement written `Type: Trait`. Read it as “this type must implement that trait.” When a handler fails to compile, act on the inner bound. The outer `Handler` line is the wrapper.",
  },
  {
    term: "Runtime",
    body: "Tokio, already started by `#[tokio::main]` and used by `axum::serve`. This course does not configure it, spawn tasks, or mention `Pin` again.",
  },
];
