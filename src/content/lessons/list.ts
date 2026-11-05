import type { Lesson } from "../types";

export const listLessons: Lesson[] = [
  {
    slug: "state-and-the-lock",
    number: 7,
    track: "list",
    minutes: 9,
    title: "State and the lock",
    summary: "The router owns the list. A request gets a cheap clone of the `Arc`, then borrows the `Vec` for one critical section.",
    diagram: "lock",
    blocks: [
      {
        type: "prose",
        text: "The list has to outlive one request, so it cannot be a local in the handler. It lives in `AppState`. The router stores that value with `.with_state`. `State<AppState>` clones it into each call. The bound on `.with_state` is `AppState: Clone`.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "`Note` is the struct from lesson 05, with `Clone` and `Serialize`.",
        code: `#[derive(Clone)]
struct AppState {
    notes: Arc<Mutex<Vec<Note>>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            notes: Arc::new(Mutex::new(Vec::new())),
        }
    }
}`,
      },
      {
        type: "prose",
        text: "Cloning `AppState` clones the `Arc`, a shared owner and a count. It does not clone the `Vec`. That is why `State` is cheap. The `Vec` stays where it is. The mutex around it means one guard at a time. `lock` borrows the list for as long as the guard lives. You already know a borrow has to end. The guard is that borrow.",
      },
      {
        type: "prose",
        text: "This course uses `std::sync::Mutex`, not Tokio's mutex. The critical section does not `.await`. Do not add an `.await` between `lock` and the drop of the guard. A `std::sync::Mutex` must not be held across a point where the task yields.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "The router ends in `.with_state(AppState::new())`. `list_notes` is registered with `get`.",
        code: `async fn list_notes(State(state): State<AppState>) -> Json<Vec<Note>> {
    let notes = state.notes.lock().expect("notes lock");
    Json(notes.clone())
}`,
      },
      {
        type: "prose",
        text: "`.clone()` here is `Vec`'s clone, seen through the guard. It is not a clone of the guard, and it is not the cheap `Arc` clone from `State`. `Json` keeps its value and serializes after your function returns, which is after the guard drops. A reference into the guard would have to live as long as that `Json`. It cannot. The clone is a `Vec` you own, taken while the borrow was still valid.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Poison",
        text: "`lock` returns a `Result`. `expect` panics if the mutex is poisoned, which happens only when some thread panicked while holding the guard. The handlers in this program do not panic while they hold it. Poison is not a request you turn into 400.",
      },
      {
        type: "pick",
        prompt: "Which return can outlive the guard? The other does not compile.",
        a: {
          code: `let notes = state.notes.lock().expect("notes lock");
Json(notes.clone())`,
        },
        b: {
          label: "fails",
          code: `let notes = state.notes.lock().expect("notes lock");
Json(&*notes)`,
        },
        answer: "a",
        why: "`Json` stores what you give it past the end of the function. `&*notes` borrows the guard, and the guard is a local. The clone is an owned `Vec<Note>`. `Note: Clone` is why that clone exists. `State` already did the cheap `Arc` clone before the function ran.",
      },
      {
        type: "links",
        items: [
          {
            label: "State",
            href: "https://docs.rs/axum/latest/axum/extract/struct.State.html",
            note: "Cloned per request. The type has to be `Clone`.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "What does extracting `State<AppState>` clone?",
        choices: [
          { id: "a", text: "The `Arc` inside `AppState`. The `Vec` stays put." },
          { id: "b", text: "The whole `Vec`, on every request, before the handler runs." },
          { id: "c", text: "The socket." },
          { id: "d", text: "The request body." },
        ],
        answer: "a",
        why: "`#[derive(Clone)]` on a struct of `Arc`s clones the pointers. The point of the `Arc` is that this clone is a count, not a copy of the notes.",
      },
      {
        id: "q2",
        prompt: "In `list_notes`, what does `notes.clone()` copy?",
        choices: [
          { id: "a", text: "The `Vec<Note>`, so `Json` can own it after the guard drops." },
          { id: "b", text: "Only the `Arc`, a second time." },
          { id: "c", text: "The guard itself." },
          { id: "d", text: "The HTTP request." },
        ],
        answer: "a",
        why: "The guard derefs to the `Vec`. `Vec`'s `clone` needs `Note: Clone`. That owned copy is what the response serializes.",
      },
      {
        id: "q3",
        prompt: "Where may this handler `.await`?",
        choices: [
          { id: "a", text: "It does not `.await` while the guard is alive." },
          { id: "b", text: "Immediately after `lock`, before reading the list." },
          { id: "c", text: "Only while the guard is alive. That is what `async` requires." },
          { id: "d", text: "On the `Vec` itself. `Vec` is a future." },
        ],
        answer: "a",
        why: "`std::sync::Mutex` is held on a thread. Yielding while holding it is the bug this course refuses. The function has no `.await` after `lock`.",
      },
    ],
  },
  {
    slug: "create-and-list",
    number: 8,
    track: "list",
    minutes: 10,
    title: "A notes list: create and list",
    summary: "One binary. `POST /notes` pushes. `GET /notes` clones the list out. An empty list is still 200.",
    diagram: "shelf",
    blocks: [
      {
        type: "prose",
        text: "This is the program, minus get-one, which is the next lesson. Create parses the body before it locks, so a 400 does not need the list. The id is `len + 1` while the guard is held, then the note is pushed. This course never deletes, so the length is a safe id. The lock makes the read and the push one critical section: two creates cannot take the same id.",
      },
      {
        type: "code",
        file: "Cargo.toml",
        lang: "plain",
        caption: "The dependency list for the rest of the course.",
        code: `[package]
name = "notes"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.8"
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread", "net"] }`,
      },
      {
        type: "code",
        file: "src/main.rs",
        caption: "A whole binary. It compiles as the only source file.",
        code: `use std::sync::{Arc, Mutex};

use axum::extract::rejection::JsonRejection;
use axum::extract::State;
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize)]
struct Note {
    id: u64,
    title: String,
    body: String,
}

#[derive(Deserialize)]
struct NewNote {
    title: String,
    body: String,
}

#[derive(Clone)]
struct AppState {
    notes: Arc<Mutex<Vec<Note>>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            notes: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/notes", get(list_notes).post(create_note))
        .with_state(AppState::new());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
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
}`,
        output: `POST /notes
content-type: application/json

{"title":"Salt","body":"Buy salt"}

HTTP/1.1 201 Created
content-type: application/json

{"id":1,"title":"Salt","body":"Buy salt"}

GET /notes

HTTP/1.1 200 OK
content-type: application/json

[{"id":1,"title":"Salt","body":"Buy salt"}]`,
        outputLabel: "exchange",
      },
      {
        type: "prose",
        text: "`GET /notes` on an empty list is `[]` and 200, not 404. Nothing is missing yet. You asked for the list, and the list exists. It happens to be empty. 404 is for one id, in the next lesson.",
      },
      {
        type: "prose",
        text: "serde checks the shape, not the taste. `{\"title\":\"\",\"body\":\"\"}` is a 201 whose strings are empty. An extra JSON field is ignored, unless you later add `#[serde(deny_unknown_fields)]`. This course does not add it. A missing field is still a 400, through the rejection map.",
      },
      {
        type: "callout",
        tone: "note",
        title: "The clone on push",
        text: "The `Vec` stores one `Note`. The response needs another, because `Json` takes ownership and the `Vec` keeps its copy. `note.clone()` before the push, then moving `note` into `Json`, is that split. `Note: Clone` is already on the struct.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "`GET /notes` when nothing has been created returns what?",
        choices: [
          { id: "a", text: "200 and `[]`." },
          { id: "b", text: "404 and an empty body." },
          { id: "c", text: "204 and no body." },
          { id: "d", text: "400, because the list is empty." },
        ],
        answer: "a",
        why: "The list is there. Empty is a valid `Vec`. 404 starts when you ask for one id and `find` returns `None`.",
      },
      {
        id: "q2",
        prompt: "When is the new id chosen?",
        choices: [
          { id: "a", text: "While the guard is held, before the push." },
          { id: "b", text: "By the client, in the JSON." },
          { id: "c", text: "By `Path`, from the URL." },
          { id: "d", text: "After the response is written." },
        ],
        answer: "a",
        why: "`notes.len() as u64 + 1` and `push` share one guard, so two requests cannot both read the same length and both claim that id.",
      },
      {
        id: "q3",
        prompt: "Why does `?` run before `lock` in `create_note`?",
        choices: [
          { id: "a", text: "A bad body should fail without touching the list." },
          { id: "b", text: "The mutex is what parses JSON." },
          { id: "c", text: "`Arc` does not compile if you lock first." },
          { id: "d", text: "201 can only be returned before a lock." },
        ],
        answer: "a",
        why: "The rejection is about the request, not about the notes. Taking the lock first would still be memory-safe here, and it would be the wrong order.",
      },
    ],
  },
  {
    slug: "option-becomes-404",
    number: 9,
    track: "list",
    minutes: 8,
    title: "Get one note",
    summary: "`find` returns `Option`. `None` becomes 404. A segment that is not a number never gets that far.",
    diagram: "option",
    blocks: [
      {
        type: "prose",
        text: "Add one route to the binary from lesson 08. `find` returns `Option<&Note>`. `cloned` needs `Note: Clone` and produces `Option<Note>`. `map(Json)` lifts that into `Option<Json<Note>>`. `ok_or` is the `Result` conversion you already use: `None` becomes `Err`, `Some` becomes `Ok`. `Err(StatusCode::NOT_FOUND)` is a 404 with an empty body. `Ok(Json(note))` is 200 and the note, because `Json`'s response status is 200.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "Add the route beside `/notes`. The handler uses `Path` and `State`, in either order. Both are part extractors.",
        code: `.route("/notes/{id}", get(get_note))

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
        output: `GET /notes/1
200 OK
{"id":1,"title":"Salt","body":"Buy salt"}

GET /notes/9
404 Not Found

GET /notes/salt
400 Bad Request
(get_note does not run)`,
        outputLabel: "responses",
      },
      {
        type: "prose",
        text: "You clone one note out of the guard, not the whole list. Same reason as `list_notes`: the response has to own its data after the guard drops. The guard drops at the end of the function. `Json` already owns the note by then.",
      },
      {
        type: "callout",
        tone: "note",
        title: "400 and 404 are different failures",
        text: "`GET /notes/salt` never enters `get_note`. `Path<u64>` rejects it as 400. `GET /notes/9` does enter, the list locks, `find` returns `None`, and you choose 404. A bad segment is the extractor. A missing note is your `Option`.",
      },
      {
        type: "pick",
        prompt: "Which expression turns a missing note into 404? The other panics on `None`.",
        a: {
          code: `notes
    .iter()
    .find(|note| note.id == id)
    .cloned()
    .map(Json)
    .ok_or(StatusCode::NOT_FOUND)`,
        },
        b: {
          code: `notes
    .iter()
    .find(|note| note.id == id)
    .cloned()
    .map(Json)
    .unwrap()`,
        },
        answer: "a",
        why: "`ok_or` makes `None` into `Err(StatusCode::NOT_FOUND)`, which is a response. `unwrap` on `None` panics, and a panic here is a 500. Both snippets type-check if the `Option` is `Option<Json<Note>>`. Only one of them is the edge this course uses. `unwrap` is not a missing-note policy.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "`GET /notes/9` when 9 was never created returns what?",
        choices: [
          { id: "a", text: "404, from `ok_or(StatusCode::NOT_FOUND)`." },
          { id: "b", text: "400, because the id is inconvenient." },
          { id: "c", text: "200 and `null`." },
          { id: "d", text: "A panic, because `find` failed." },
        ],
        answer: "a",
        why: "The segment parsed. The list did not contain that id. `None` is the ordinary `Option` case, mapped to a status.",
      },
      {
        id: "q2",
        prompt: "`GET /notes/salt` returns what?",
        choices: [
          { id: "a", text: "400 from `Path`, and `get_note` does not run." },
          { id: "b", text: "404 from `ok_or`." },
          { id: "c", text: "422 from serde on the body." },
          { id: "d", text: "201, and a note titled salt." },
        ],
        answer: "a",
        why: "There is no body on this GET. The failure is the path segment, before the handler, so it cannot be your `Option`.",
      },
      {
        id: "q3",
        prompt: "What does `ok_or(StatusCode::NOT_FOUND)` do to `None`?",
        choices: [
          { id: "a", text: "It becomes `Err(StatusCode::NOT_FOUND)`." },
          { id: "b", text: "It becomes `Ok` with an empty note." },
          { id: "c", text: "It locks the mutex again." },
          { id: "d", text: "It serializes `None` as `null` and returns 200." },
        ],
        answer: "a",
        why: "`Some(json)` becomes `Ok(json)`. You already know this conversion. The new part is that `Err(StatusCode)` is a response Axum can send.",
      },
    ],
  },
];
