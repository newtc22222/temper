import type { Lesson } from "../types";

export const requestLessons: Lesson[] = [
  {
    slug: "what-the-framework-owns",
    number: 1,
    track: "request",
    minutes: 8,
    title: "What the framework owns",
    summary: "A handler is a function. The framework owns the socket. You own the values you return.",
    diagram: "owns",
    blocks: [
      {
        type: "prose",
        text: "A web service is a function the framework calls, plus a socket you do not want to own. You already know how to own a `Vec` and how to return a `Result`. Axum does not ask you to learn a second language. It asks you to put that function where a request can reach it.",
      },
      {
        type: "prose",
        text: "The framework owns the TCP socket, the loop that accepts connections, the table that picks which function runs, and the writing of the status line and the headers. You own the values you return, the notes you keep in `State`, and the decision that a missing note is 404. You never write to the socket. When your handler returns, Axum turns that value into bytes.",
      },
      {
        type: "heading",
        text: "What it is asking",
      },
      {
        type: "list",
        items: [
          "Give it a function. That function is the handler.",
          "Let it turn the request into arguments. Those arguments are extractors: `Path`, `Json`, `State`.",
          "Return a value it already knows how to send. A string, a status code, or `Json<T>`.",
        ],
      },
      {
        type: "callout",
        tone: "note",
        title: "Tokio, once",
        text: "Axum does not make you configure an async runtime. `#[tokio::main]` starts Tokio, `TcpListener::bind` takes a port, and `axum::serve` hands each connection to the router. That is the whole of Tokio in this course. The runtime is already running when your handler is called. You will not spawn tasks, and you will not read about `Pin`.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "One framework",
        text: "This course does not cover Actix, Rocket, Leptos, or Yew. It does not deploy, and it does not open a database. The program at the end is an in-memory list: create a note, list the notes, get one note.",
      },
      {
        type: "links",
        items: [
          {
            label: "Axum",
            href: "https://docs.rs/axum/latest/axum/",
            note: "The crate this course stays inside.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Who owns the TCP socket?",
        choices: [
          { id: "a", text: "Axum, for the whole connection." },
          { id: "b", text: "Your handler, because it returns the response." },
          { id: "c", text: "serde, because it reads the body." },
          { id: "d", text: "The `Vec` of notes." },
        ],
        answer: "a",
        why: "The handler returns a value. Axum writes that value to a connection it already accepted. You do not hold the socket.",
      },
      {
        id: "q2",
        prompt: "What is a handler?",
        choices: [
          { id: "a", text: "A function Axum calls when a route matches." },
          { id: "b", text: "A trait you implement by hand for every route." },
          { id: "c", text: "The type of the socket." },
          { id: "d", text: "A Cargo feature you turn on for JSON." },
        ],
        answer: "a",
        why: "You do not implement the `Handler` trait yourself. Axum implements it for functions whose arguments are extractors and whose return value can become a response.",
      },
      {
        id: "q3",
        prompt: "What is Tokio doing in this course?",
        choices: [
          { id: "a", text: "It is the runtime Axum already starts." },
          { id: "b", text: "It is a second HTTP framework, used beside Axum." },
          { id: "c", text: "It is the type of a handler." },
          { id: "d", text: "It stores the notes." },
        ],
        answer: "a",
        why: "`#[tokio::main]` and `axum::serve` are the only Tokio you write. After that, the runtime is already running.",
      },
    ],
  },
  {
    slug: "a-handler-that-returns-text",
    number: 2,
    track: "request",
    minutes: 7,
    title: "A handler that returns text",
    summary: "The smallest handler is an async function that returns a string. Axum already knows how to send it.",
    diagram: "signature",
    blocks: [
      {
        type: "prose",
        text: "`&'static str` is text that lives for the whole program. Axum implements `IntoResponse` for it, so returning the string is enough. You do not build a response object, and you do not set a header.",
      },
      {
        type: "code",
        file: "Cargo.toml",
        lang: "plain",
        caption: "Three Tokio features, and no others: macros for the attribute, a runtime, and the network types.",
        code: `[package]
name = "notes"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.8"
tokio = { version = "1", features = ["macros", "rt-multi-thread", "net"] }`,
      },
      {
        type: "code",
        file: "src/main.rs",
        caption: "A whole binary. `hello` is the handler. `main` only binds a port and serves the router.",
        code: `use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(hello));
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn hello() -> &'static str {
    "notes"
}`,
        output: `HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8

notes`,
        outputLabel: "response",
      },
      {
        type: "prose",
        text: "`routing::get(hello)` registers the function. `get` checks one bound. Read it as a sentence: this function can be a handler. You do not write the bound. You write `async fn`, arguments that are extractors, and a return type that can be a response. This function has no arguments. A string is a response.",
      },
      {
        type: "prose",
        text: "The body of `hello` does not await anything. Axum would also accept a plain `fn` here. This course still writes `async fn`, so the later handlers have the same shape. The waiting in this program is in `main` (`bind` and `serve`) and inside extractors, which run before your function is entered.",
      },
      {
        type: "callout",
        tone: "note",
        title: "An empty return is still a response",
        text: "`()` implements `IntoResponse` as an empty 200. Forgetting the string is not a compiler error. It is a blank body. Return the text you mean to send.",
      },
      {
        type: "pick",
        prompt: "Which registration compiles? The other is a real function, and it is not a handler.",
        a: {
          code: `let app = Router::new().route("/", get(hello));

async fn hello() -> &'static str {
    "notes"
}`,
        },
        b: {
          label: "fails",
          code: `let app = Router::new().route("/", get(hello));

async fn hello(listener: tokio::net::TcpListener) -> &'static str {
    "notes"
}`,
        },
        answer: "a",
        why: "The handler does not receive the socket. `TcpListener` is not an extractor, so `get(hello)` cannot satisfy `Handler`. The framework already owns the listener, up in `main`.",
      },
      {
        type: "links",
        items: [
          {
            label: "IntoResponse",
            href: "https://docs.rs/axum/latest/axum/response/trait.IntoResponse.html",
            note: "The bound on a return value. Strings already implement it.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "What does returning `&'static str` put on the wire?",
        choices: [
          { id: "a", text: "Status 200 and `text/plain; charset=utf-8`." },
          { id: "b", text: "Status 200 and `application/json`." },
          { id: "c", text: "Status 404, because the handler took no path." },
          { id: "d", text: "A panic, because the string is not `Json`." },
        ],
        answer: "a",
        why: "Axum's `IntoResponse` for a string is a plain-text body and status 200. JSON is a different return type, `Json<T>`.",
      },
      {
        id: "q2",
        prompt: "What is `get(hello)` checking?",
        choices: [
          { id: "a", text: "That `hello` can be a handler." },
          { id: "b", text: "That port 3000 is free." },
          { id: "c", text: "That the string parses as JSON." },
          { id: "d", text: "That you wrote an `impl Handler for hello`." },
        ],
        answer: "a",
        why: "The port is checked later, at `bind`. `get` only cares that the function's arguments and return type fit a handler.",
      },
      {
        id: "q3",
        prompt: "Where is the connection accepted?",
        choices: [
          { id: "a", text: "In `main`, by `axum::serve` on the listener." },
          { id: "b", text: "Inside `hello`, before the string is returned." },
          { id: "c", text: "By serde, when the body is read." },
          { id: "d", text: "By `Clone`, when the router is built." },
        ],
        answer: "a",
        why: "`hello` returns text. It never sees the listener. `unwrap` on `bind` or `serve` stops the process if startup fails. That is not a request status.",
      },
    ],
  },
  {
    slug: "paths-and-path",
    number: 3,
    track: "request",
    minutes: 8,
    title: "Paths and Path",
    summary: "The router matches a path. `Path<u64>` turns one segment into an integer you own.",
    diagram: "path",
    blocks: [
      {
        type: "prose",
        text: "A route path is a string. In Axum 0.8 a capture is written in braces: `/notes/{id}`. The 0.7 form with a colon is not the capture syntax this course uses. Braces name the segment in the route. They are not a Rust binding.",
      },
      {
        type: "prose",
        text: "`Path<u64>` deserializes that one segment into an integer. With a single segment, the primitive takes the segment's text. Your binding is the name in the pattern: `Path(id)` calls it `id` even if the braces say `{note_id}`. You own the `u64`. You do not keep a slice of the URL.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "The route line lives on the router, next to `hello`. The function can sit beside it.",
        code: `async fn get_note(Path(id): Path<u64>) -> String {
    format!("note {id}")
}

// on the router:
// .route("/notes/{id}", get(get_note))`,
        output: `GET /notes/4
note 4

GET /notes/salt
400 Bad Request
(the handler does not run)`,
        outputLabel: "responses",
      },
      {
        type: "prose",
        text: "A segment that does not fit `u64` is a `PathRejection`. Axum turns that rejection into 400 before your function starts. You do not `unwrap` a parse, and you do not look at the raw path. The failure is a `Result` inside the extractor, not a panic in your body.",
      },
      {
        type: "callout",
        tone: "note",
        title: "More than one segment",
        text: "One `Path` can take several captures: a tuple, in brace order, or a struct whose field names match the brace names and which derives `Deserialize`. This course only needs one `u64`.",
      },
      {
        type: "pick",
        prompt: "Which route captures an id on Axum 0.8?",
        a: {
          code: `.route("/notes/{id}", get(get_note))`,
        },
        b: {
          code: `.route("/notes/:id", get(get_note))`,
        },
        answer: "a",
        why: "0.8 captures are `{id}`. A colon is not the capture form this version documents. The extractor and the route string have to agree, or the segment never becomes a `u64`.",
      },
      {
        type: "links",
        items: [
          {
            label: "Path",
            href: "https://docs.rs/axum/latest/axum/extract/struct.Path.html",
            note: "Captures, tuples, and the 400 on a bad segment.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Which path string captures an id in Axum 0.8?",
        choices: [
          { id: "a", text: "`/notes/{id}`" },
          { id: "b", text: "`/notes/:id`" },
          { id: "c", text: "`/notes/(id)`" },
          { id: "d", text: "`/notes/<id>`" },
        ],
        answer: "a",
        why: "Captures use braces. The colon form belongs to Axum 0.7, which this course does not write.",
      },
      {
        id: "q2",
        prompt: "What happens on `GET /notes/salt` if the extractor is `Path<u64>`?",
        choices: [
          { id: "a", text: "400, and `get_note` does not run." },
          { id: "b", text: "The handler runs with `id` equal to 0." },
          { id: "c", text: "The handler panics on a failed parse." },
          { id: "d", text: "404, because salt is not in the list." },
        ],
        answer: "a",
        why: "Deserializing the segment failed, so Axum rejects the request. 404 is a later choice, for a number that parsed and was not in the list.",
      },
      {
        id: "q3",
        prompt: "In `Path(id): Path<u64>`, what is `id`?",
        choices: [
          { id: "a", text: "Your binding. The `u64` is owned by the handler." },
          { id: "b", text: "A borrow of the socket, named by the braces." },
          { id: "c", text: "A `&str` pointing into the request line." },
          { id: "d", text: "The name of a field on `State`." },
        ],
        answer: "a",
        why: "The pattern names the local. `Path<u64>` has already parsed the segment into an integer. There is no request string left to borrow.",
      },
    ],
  },
];
