import type { Lesson } from "../types";

export const programLessons: Lesson[] = [
  {
    slug: "reading-the-trait-error",
    number: 10,
    track: "program",
    minutes: 9,
    title: "Reading the trait error",
    summary: "A bound is `Type: Trait`. The outer `Handler` line is the wrapper. The inner bound is the fix.",
    diagram: "bound",
    blocks: [
      {
        type: "prose",
        text: "When a handler is wrong, rustc does not say that your server is wrong. It says a trait bound is not satisfied. A bound is written `Type: Trait`. Read it as one sentence: this type is required to implement that trait. You do not need a trait chapter to repair one line. You need to read which type, and which trait.",
      },
      {
        type: "prose",
        text: "The first bound is often a wrapper. It says your function does not implement `Handler`. That is true and, by itself, useless. Axum implements `Handler` for a function when the arguments are extractors, the return type implements `IntoResponse`, and the state type matches the router. Keep going. The next bound names the actual mismatch.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fails",
        caption: "Line numbers on your machine will differ. The bound will not. This struct is not the `AppState` from lesson 07.",
        code: `struct AppState {
    notes: Vec<Note>,
}

let state = AppState { notes: Vec::new() };
let app = Router::new()
    .route("/notes", get(list_notes))
    .with_state(state);`,
        output: `error[E0277]: the trait bound \`AppState: Clone\` is not satisfied
   = note: required by a bound in \`Router::<S>::with_state\``,
        outputLabel: "rustc",
      },
      {
        type: "prose",
        text: "`with_state` clones the state for every request. The bound says `Clone`, so `Clone` is the thing to fix. Deriving it on a struct that owns a `Vec` would compile, and it would copy every note on every request. That satisfies the compiler and misses the point. The state from lesson 07 is the fix the bound is pointing at: `#[derive(Clone)]`, with an `Arc<Mutex<...>>` inside, so the clone `State` performs is a count.",
      },
      {
        type: "heading",
        text: "Same habit, second bound",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fails",
        caption: "Abbreviated. The body of the function does not matter. The return type does.",
        code: `async fn get_note(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> Note {
    // ...
}`,
        output: `error[E0277]: the trait bound \`Note: IntoResponse\` is not satisfied`,
        outputLabel: "rustc",
      },
      {
        type: "prose",
        text: "Change the thing the bound names. Return `Json<Note>`, and derive `Serialize` if the next bound says `Note: Serialize`. A bare `Note` is not a response. If the wrapper above this line still mentions `Handler`, ignore it until the inner bound is gone.",
      },
      {
        type: "callout",
        tone: "note",
        title: "A third shape, same reading",
        text: "Two body extractors, or a `Json` that is not last, also fail `Handler`. The inner note is the one that says the body was already taken, or that a type is not an extractor. You still do not implement `Handler` yourself. You fix the signature the inner bound describes.",
      },
      {
        type: "pick",
        prompt: "The compiler says `Handler` is not implemented, and under that, `AppState: Clone` is not implemented. What do you do?",
        a: {
          code: `#[derive(Clone)]
struct AppState {
    notes: Arc<Mutex<Vec<Note>>>,
}`,
        },
        b: {
          label: "fails",
          code: `impl Handler for AppState {
    // ...
}`,
        },
        answer: "a",
        why: "You do not implement `Handler` for your state or for your function. Axum already does, for functions, once `AppState: Clone` is true and the clone is the cheap one. The inner bound is the line to act on.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "How do you read `AppState: Clone`?",
        choices: [
          { id: "a", text: "`AppState` must implement `Clone`." },
          { id: "b", text: "`Clone` must implement `AppState`." },
          { id: "c", text: "The `Vec` is empty." },
          { id: "d", text: "The request is cloned onto the socket." },
        ],
        answer: "a",
        why: "The type is on the left, the required trait on the right. That is the whole of the notation this course needs.",
      },
      {
        id: "q2",
        prompt: "Which line do you act on first?",
        choices: [
          { id: "a", text: "The inner bound that names the missing trait." },
          { id: "b", text: "Only the word `Handler`, by writing the trait yourself." },
          { id: "c", text: "Whichever error is longest." },
          { id: "d", text: "The status code, by returning 500." },
        ],
        answer: "a",
        why: "`Handler` is the wrapper Axum shows because `get` asked for a handler. The nested `E0277` says what is actually missing.",
      },
      {
        id: "q3",
        prompt: "`Note: IntoResponse` is satisfied by which change?",
        choices: [
          { id: "a", text: "Return `Json<Note>`, with `Serialize` on `Note`." },
          { id: "b", text: "Derive `Copy` on `Note`." },
          { id: "c", text: "Return `()` instead, and drop the note." },
          { id: "d", text: "Remove `async` from the function." },
        ],
        answer: "a",
        why: "`Json<Note>` implements `IntoResponse` when the note can be serialized. `Copy` does not make a response. `()` would compile and send an empty 200, which is the wrong body.",
      },
    ],
  },
  {
    slug: "the-module-split",
    number: 11,
    track: "program",
    minutes: 8,
    title: "The module split",
    summary: "`main` starts the runtime. `notes` owns the structs. `routes` owns the handlers. Same program.",
    diagram: "modules",
    blocks: [
      {
        type: "prose",
        text: "The single file is long, not clever. Split it the way you already split Rust. `main` starts Tokio and serves the router. `notes` owns the structs and the constructor. `routes` owns the handlers and the route table. No new architecture. Three modules, one binary.",
      },
      {
        type: "code",
        file: "src/main.rs",
        caption: "The crate root of a binary is `main.rs`. `mod` declares the two files.",
        code: `mod notes;
mod routes;

#[tokio::main]
async fn main() {
    let app = routes::router();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}`,
      },
      {
        type: "code",
        file: "src/notes.rs",
        caption: "Fields are `pub` because `routes` builds a `Note` and locks the list. `Serialize` still works.",
        code: `use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Clone, Serialize)]
pub struct Note {
    pub id: u64,
    pub title: String,
    pub body: String,
}

#[derive(Deserialize)]
pub struct NewNote {
    pub title: String,
    pub body: String,
}

#[derive(Clone)]
pub struct AppState {
    pub notes: Arc<Mutex<Vec<Note>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            notes: Arc::new(Mutex::new(Vec::new())),
        }
    }
}`,
      },
      {
        type: "code",
        file: "src/routes.rs",
        caption: "Handlers stay private. `router` is public because `main` calls it.",
        code: `use axum::extract::rejection::JsonRejection;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};

use crate::notes::{AppState, NewNote, Note};

pub fn router() -> Router {
    Router::new()
        .route("/notes", get(list_notes).post(create_note))
        .route("/notes/{id}", get(get_note))
        .with_state(AppState::new())
}

async fn list_notes(State(state): State<AppState>) -> Json<Vec<Note>> {
    let notes = state.notes.lock().expect("notes lock");
    Json(notes.clone())
}

async fn create_note(
    State(state): State<AppState>,
    body: Result<Json<NewNote>, JsonRejection>,
) -> Result<(StatusCode, Json<Note>), StatusCode> {
    let Json(new_note) = body.map_err(|_| StatusCode::BAD_REQUEST)?;

    let mut notes = state.notes.lock().expect("notes lock");
    let note = Note {
        id: notes.len() as u64 + 1,
        title: new_note.title,
        body: new_note.body,
    };
    notes.push(note.clone());
    Ok((StatusCode::CREATED, Json(note)))
}

async fn get_note(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> Result<Json<Note>, StatusCode> {
    let notes = state.notes.lock().expect("notes lock");
    notes
        .iter()
        .find(|note| note.id == id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}`,
      },
      {
        type: "prose",
        text: "`use crate::notes::{AppState, NewNote, Note}` is an ordinary path. `crate` is this binary. The handlers are private because nothing outside `routes` calls them. `pub fn router` exists so `main` can name it. `-> Router` is `Router<()>`, which is what `.with_state` produces. `axum::serve` can take that value directly.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Not a global",
        text: "Do not hide the list in a `lazy_static` or a process-wide `Mutex` inside `notes`. The router owns the state, created once in `router`. A second router, later, in a test you write yourself, can be given a second state. A global cannot.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Which file defines `Note` and `AppState`?",
        choices: [
          { id: "a", text: "`src/notes.rs`" },
          { id: "b", text: "`src/main.rs`" },
          { id: "c", text: "`Cargo.toml`" },
          { id: "d", text: "The client that sends the JSON." },
        ],
        answer: "a",
        why: "`main` only starts the runtime. The data lives next to its constructor. The handlers live next to the routes.",
      },
      {
        id: "q2",
        prompt: "Why is `router` public, while the handlers are not?",
        choices: [
          { id: "a", text: "`main` calls `router` from another module. Nothing calls the handlers but Axum, inside this module." },
          { id: "b", text: "Axum refuses a function unless it is `pub`." },
          { id: "c", text: "JSON requires every function to be public." },
          { id: "d", text: "404 is only returned from public functions." },
        ],
        answer: "a",
        why: "Privacy is the module rule you already know. Axum calls the handlers by value from `get` and `post` in the same module. It does not need them to be public.",
      },
      {
        id: "q3",
        prompt: "What does `router` return after `.with_state`?",
        choices: [
          { id: "a", text: "A `Router` whose state is already stored, so `serve` can take it." },
          { id: "b", text: "A `Router` that still expects you to pass `AppState` on every request." },
          { id: "c", text: "The `Vec` itself." },
          { id: "d", text: "A `TcpListener`." },
        ],
        answer: "a",
        why: "`.with_state` consumes the router that was waiting for an `AppState` and gives back a router with no state left to fill in. That is the value `axum::serve` runs.",
      },
    ],
  },
  {
    slug: "one-request",
    number: 12,
    track: "program",
    minutes: 8,
    title: "Walk one request",
    summary: "From the socket to the response, one `POST /notes`, and no step you have not already read.",
    diagram: "walk",
    blocks: [
      {
        type: "prose",
        text: "No new types. The list is empty. The request is `POST /notes`, header `Content-Type: application/json`, body `{\"title\":\"Salt\",\"body\":\"Buy salt\"}`. Nothing in this walk panics.",
      },
      {
        type: "list",
        items: [
          "Tokio has already accepted the TCP connection. Axum owns that socket. Your code has not run.",
          "The router matches `POST /notes` to `create_note`. `GET /notes` is a different method on the same path, and it is not this request.",
          "`State` clones `AppState`. That clone is the `Arc`. The `Vec` is not copied here.",
          "`Json` checks the content type, consumes the body, and deserializes an owned `NewNote`. The buffer is gone. If this step fails, your `map_err` returns 400 and the lock is never taken.",
          "The handler locks, reads `len + 1`, pushes a `Note`, and returns `Ok((StatusCode::CREATED, Json(note)))`. The `Vec` keeps one note. `Json` owns the other. The guard drops when the function returns.",
          "`IntoResponse` writes status 201, `content-type: application/json`, and the serialized note. Axum writes those bytes to the socket. You do not.",
        ],
      },
      {
        type: "code",
        lang: "plain",
        caption: "The response after those six stops. A second identical POST returns id 2, not a 400. This program does not treat a repeated title as a conflict.",
        code: `HTTP/1.1 201 Created
content-type: application/json

{"id":1,"title":"Salt","body":"Buy salt"}`,
      },
      {
        type: "heading",
        text: "What you did not do",
      },
      {
        type: "list",
        items: [
          "You did not read or write the socket.",
          "You did not assemble a status line by hand.",
          "You did not build an error enum.",
          "You did not open a database, and you did not check a password.",
          "You did not configure Tokio past `#[tokio::main]` and `axum::serve`.",
        ],
      },
      {
        type: "prose",
        text: "The usual next replacement, outside this course, is a pool in `AppState` instead of `Arc<Mutex<Vec<Note>>>`. The handler shape does not change: extractors in, a `Result` out. If you can read `create_note` from the arguments to the `Ok` without skipping, you have the layer this course was for. The language course is still the one that taught you the `Result`.",
      },
      {
        type: "links",
        items: [
          {
            label: "Axum",
            href: "https://docs.rs/axum/latest/axum/",
            note: "Routing, extractors, and `serve`, in the crate’s own words.",
          },
          {
            label: "JsonRejection",
            href: "https://docs.rs/axum/latest/axum/extract/rejection/enum.JsonRejection.html",
            note: "The error this course maps to 400, if you later want the specific cases.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "On this POST, what does `State` clone?",
        choices: [
          { id: "a", text: "`AppState`, which means the `Arc`, not the `Vec`." },
          { id: "b", text: "The body bytes." },
          { id: "c", text: "The socket." },
          { id: "d", text: "The response, after it is written." },
        ],
        answer: "a",
        why: "The expensive copy of the notes, if any, is the explicit `clone` when you push and when you list. `State` is the cheap one, and it happens before the handler body.",
      },
      {
        id: "q2",
        prompt: "When does the guard drop, relative to serialization?",
        choices: [
          { id: "a", text: "When `create_note` returns. `Json` already owns the note it will serialize." },
          { id: "b", text: "While Axum is writing the socket, still holding the `Vec`." },
          { id: "c", text: "It does not drop. The lock is process-wide." },
          { id: "d", text: "Before the body is parsed." },
        ],
        answer: "a",
        why: "Locals drop as the function returns. The returned `Json<Note>` was built first, and it does not borrow the guard. Serialization uses that owned note.",
      },
      {
        id: "q3",
        prompt: "The same POST arrives again, after the first one succeeded. What comes back?",
        choices: [
          { id: "a", text: "201 and a note with id 2." },
          { id: "b", text: "400, because the title was already used." },
          { id: "c", text: "404, because create only works once." },
          { id: "d", text: "201 and another note with id 1." },
        ],
        answer: "a",
        why: "Nothing in `create_note` looks at existing titles. The lock only makes the next id unique. Duplicate text is two notes.",
      },
    ],
  },
];
