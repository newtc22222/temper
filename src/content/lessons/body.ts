import type { Lesson } from "../types";

export const bodyLessons: Lesson[] = [
  {
    slug: "json-in",
    number: 4,
    track: "body",
    minutes: 9,
    title: "JSON in, with serde",
    summary: "`Deserialize` on a struct you already understand. The parsed body is owned. Failure is a `Result`.",
    diagram: "body",
    blocks: [
      {
        type: "prose",
        text: "`NewNote` is an ordinary struct. `#[derive(Deserialize)]` asks serde to generate the code that reads those fields from JSON. You are not writing a parser, and you are not opening a trait chapter. You are telling the derive which fields exist.",
      },
      {
        type: "code",
        file: "Cargo.toml",
        lang: "plain",
        label: "fragment",
        caption: "Add this next to `axum` and `tokio`. The `derive` feature is what makes the attribute compile.",
        code: `serde = { version = "1", features = ["derive"] }`,
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "Imports for this fragment: `axum::Json` and `serde::Deserialize`. The route is `.route(\"/notes\", post(create_note))`.",
        code: `#[derive(Deserialize)]
struct NewNote {
    title: String,
    body: String,
}

async fn create_note(Json(new_note): Json<NewNote>) -> String {
    new_note.title
}`,
      },
      {
        type: "prose",
        text: "`Json<NewNote>` consumes the body. You receive an owned `NewNote`. `title` and `body` are `String`s you own. The request buffer is not still there to borrow. A missing field, a number where a string was required, or bytes that are not JSON: those are a `JsonRejection`. That is the `Err` of a `Result`. Deserialization does not panic.",
      },
      {
        type: "prose",
        text: "`Json` reads the body, so it has to be the last argument once other extractors show up. `State` and `Path` do not read the body, so they come first. Two `Json` arguments cannot share one body. It can be consumed once.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Content type",
        text: "The extractor also requires `Content-Type: application/json`, or a type that ends in `+json`. If the header is missing and you leave `Json` unwrapped, Axum rejects the request with 415. Still not a panic.",
      },
      {
        type: "pick",
        prompt: "Which signature owns the parsed note? The other does not compile: there is no request left to borrow.",
        a: {
          code: `async fn create_note(Json(new_note): Json<NewNote>) -> String {
    new_note.title
}`,
        },
        b: {
          label: "fails",
          code: `async fn create_note(note: &NewNote) -> String {
    note.title.clone()
}`,
        },
        answer: "a",
        why: "`&NewNote` is not an extractor. Nothing in scope is borrowing the body. `Json` parses the bytes, drops the buffer, and hands you an owned struct.",
      },
      {
        type: "links",
        items: [
          {
            label: "Json",
            href: "https://docs.rs/axum/latest/axum/extract/struct.Json.html",
            note: "Consumes the body. Requires `Deserialize`.",
          },
          {
            label: "Deserialize",
            href: "https://docs.rs/serde/latest/serde/trait.Deserialize.html",
            note: "The serde trait the derive implements.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "After `Json(new_note): Json<NewNote>`, what do you own?",
        choices: [
          { id: "a", text: "A `NewNote`, including its two `String`s." },
          { id: "b", text: "A borrow of the socket." },
          { id: "c", text: "The original body bytes, still in the request." },
          { id: "d", text: "A status code, and nothing else." },
        ],
        answer: "a",
        why: "The extractor's job is to turn the body into a value and give that value to you. The buffer does not outlive the parse.",
      },
      {
        id: "q2",
        prompt: "The body is `{\"title\":\"Salt\"}` and `body` is missing. What happens?",
        choices: [
          { id: "a", text: "A `JsonRejection`. The handler body does not see a note." },
          { id: "b", text: "A panic inside serde." },
          { id: "c", text: "`body` becomes an empty `String`, and you return 200." },
          { id: "d", text: "Axum skips the field and calls the handler anyway." },
        ],
        answer: "a",
        why: "The shape does not match `NewNote`. That is a failed extraction, a `Result`, not a panic and not a half-built struct.",
      },
      {
        id: "q3",
        prompt: "Why does `Json` come last in the argument list?",
        choices: [
          { id: "a", text: "It consumes the body. The body can be taken once." },
          { id: "b", text: "Arguments are required to be alphabetical." },
          { id: "c", text: "`State` is required to be last." },
          { id: "d", text: "So the status code is chosen first." },
        ],
        answer: "a",
        why: "`Path` and `State` read parts, not the body, so their order relative to each other is free. The body extractor is the last one.",
      },
    ],
  },
  {
    slug: "json-out",
    number: 5,
    track: "body",
    minutes: 7,
    title: "JSON out",
    summary: "`Serialize` is the way back. `Json<Note>` sets the content type and takes the note by value.",
    diagram: "jsonout",
    blocks: [
      {
        type: "prose",
        text: "The way out is the same kind of struct, with `Serialize` instead of `Deserialize`. `Json(note)` takes the note by value. It sets `content-type: application/json` and serializes when the response is built. A bare `Note` does not implement `IntoResponse`. `Json<Note>` does, and only if `Note: Serialize`.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "Needs `use serde::Serialize` and `use axum::Json`. This handler both reads a body and returns JSON. It does not store anything yet.",
        code: `#[derive(Clone, Serialize)]
struct Note {
    id: u64,
    title: String,
    body: String,
}

async fn show(Json(new_note): Json<NewNote>) -> Json<Note> {
    Json(Note {
        id: 1,
        title: new_note.title,
        body: new_note.body,
    })
}`,
        output: `HTTP/1.1 200 OK
content-type: application/json

{"id":1,"title":"Salt","body":"Buy salt"}`,
        outputLabel: "response",
      },
      {
        type: "prose",
        text: "`u64` becomes a JSON number. `String` becomes a JSON string. Field names become keys. A method is not a field, so it is not serialized. You moved `title` and `body` out of `NewNote` into `Note`. That is ordinary ownership. `Json` then owns the `Note`.",
      },
      {
        type: "callout",
        tone: "note",
        title: "If Serialize is missing",
        text: "The compiler does not say “JSON is unhappy.” It says `Note: Serialize` is not satisfied, or that `Json<Note>` cannot be a response because of that bound. The fix is the derive, not a new return type invented for the error.",
      },
      {
        type: "pick",
        prompt: "Which return type will compile and send JSON?",
        a: {
          code: `async fn show(Json(new_note): Json<NewNote>) -> Json<Note> {
    Json(Note {
        id: 1,
        title: new_note.title,
        body: new_note.body,
    })
}`,
        },
        b: {
          label: "fails",
          code: `async fn show(Json(new_note): Json<NewNote>) -> Note {
    Note {
        id: 1,
        title: new_note.title,
        body: new_note.body,
    }
}`,
        },
        answer: "a",
        why: "`Note` does not implement `IntoResponse`. Wrapping it in `Json` does, once `Serialize` is derived. The status stays 200 unless you add a `StatusCode` yourself.",
      },
      {
        type: "links",
        items: [
          {
            label: "Serialize",
            href: "https://docs.rs/serde/latest/serde/trait.Serialize.html",
            note: "The bound `Json<T>` needs on the way out.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Which header does `Json<Note>` set?",
        choices: [
          { id: "a", text: "`content-type: application/json`" },
          { id: "b", text: "`content-type: text/plain; charset=utf-8`" },
          { id: "c", text: "`content-type: text/html`" },
          { id: "d", text: "No content type. The client is expected to guess." },
        ],
        answer: "a",
        why: "That header is part of `Json`'s `IntoResponse`. You do not set it by hand in this course.",
      },
      {
        id: "q2",
        prompt: "Why does `Note` derive `Serialize`?",
        choices: [
          { id: "a", text: "So `Json<Note>` can write the fields." },
          { id: "b", text: "So `Path` can parse an id." },
          { id: "c", text: "So the mutex compiles." },
          { id: "d", text: "So the socket can be cloned." },
        ],
        answer: "a",
        why: "`Deserialize` was for the incoming `NewNote`. Outgoing JSON is `Serialize`. They are different derives, even when the fields look alike.",
      },
      {
        id: "q3",
        prompt: "Returning a bare `Note` from a handler fails which bound?",
        choices: [
          { id: "a", text: "`Note: IntoResponse`" },
          { id: "b", text: "`Note: Clone`" },
          { id: "c", text: "`Note: Default`" },
          { id: "d", text: "`String: From<Note>`" },
        ],
        answer: "a",
        why: "A handler's return type has to become a response. `Json<Note>` is the response. `Note` is only the value inside it.",
      },
    ],
  },
  {
    slug: "result-and-status",
    number: 6,
    track: "body",
    minutes: 9,
    title: "Result and status codes",
    summary: "A missing note will be 404. A bad body is 400. No error tower.",
    diagram: "status",
    blocks: [
      {
        type: "prose",
        text: "`StatusCode` implements `IntoResponse`. So does `Result<T, StatusCode>`, when `T` does. `Ok` becomes the success response. `Err(StatusCode::NOT_FOUND)` becomes a 404 with an empty body. This course does not build an error enum, a JSON error shape, or a tower of middleware. The status is the message.",
      },
      {
        type: "prose",
        text: "A bad body is handled by wrapping the extractor. `Result<Json<NewNote>, JsonRejection>` means the rejection comes into your function instead of being answered by Axum's default. Map every rejection to 400. Then `?` returns that status.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "The list is not here yet, so the id is fixed at 1. Imports include `JsonRejection`, `StatusCode`, `Json`, and the two structs.",
        code: `async fn create_note(
    body: Result<Json<NewNote>, JsonRejection>,
) -> Result<(StatusCode, Json<Note>), StatusCode> {
    let Json(new_note) = body.map_err(|_| StatusCode::BAD_REQUEST)?;
    let note = Note {
        id: 1,
        title: new_note.title,
        body: new_note.body,
    };
    Ok((StatusCode::CREATED, Json(note)))
}`,
        output: `valid body
201 Created
{"id":1,"title":"Salt","body":"Buy salt"}

not JSON, or JSON of the wrong shape
400 Bad Request
(empty body)`,
        outputLabel: "responses",
      },
      {
        type: "prose",
        text: "If you leave `Json<NewNote>` unwrapped, Axum answers for you, and the statuses are more specific. Bytes that are not JSON are 400. JSON that does not match the struct is 422. A missing or non-JSON content type is 415. This course maps all three to 400 so a bad body is one status at the edge. Splitting them can wait. You do not need a custom error type to do it later, either. You would match on `JsonRejection` instead of discarding it with `_`.",
      },
      {
        type: "prose",
        text: "A missing note is not a bad body. Lesson 09 turns `None` into `StatusCode::NOT_FOUND`. Do not use 400 for that. 400 means the request could not be read. 404 means the list was readable and the id was not in it. 201 means a note was stored. 200, with no extra status, is what `Json<T>` and `&'static str` already return.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Do not unwrap the rejection",
        text: "`unwrap` or `expect` on the extractor's `Result` turns a bad body into a panic. A panic in a handler becomes 500. That is the wrong status for a client who sent the wrong JSON. Use `?`.",
      },
      {
        type: "pick",
        prompt: "Both of these parse. Which one answers a bad body with 400?",
        a: {
          code: `let Json(new_note) = body.map_err(|_| StatusCode::BAD_REQUEST)?;`,
        },
        b: {
          code: `let Json(new_note) = body.unwrap();`,
        },
        answer: "a",
        why: "`map_err` plus `?` returns `Err(StatusCode::BAD_REQUEST)` from the handler. `unwrap` panics, and the client sees 500. The second snippet is also the wrong status even when it runs.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "What body does `Err(StatusCode::NOT_FOUND)` send?",
        choices: [
          { id: "a", text: "An empty body, with status 404." },
          { id: "b", text: "A JSON object you are required to design." },
          { id: "c", text: "The panic message." },
          { id: "d", text: "The whole list of notes." },
        ],
        answer: "a",
        why: "`StatusCode` as a response is only the status. This course does not invent an error payload.",
      },
      {
        id: "q2",
        prompt: "In this course, a body that fails `Json<NewNote>` becomes which status?",
        choices: [
          { id: "a", text: "400, because we map `JsonRejection` ourselves." },
          { id: "b", text: "404, because the note was not stored." },
          { id: "c", text: "201, with an empty note." },
          { id: "d", text: "200, and the handler picks default fields." },
        ],
        answer: "a",
        why: "The `map_err` line collapses syntax errors, shape errors, and content-type errors into `BAD_REQUEST`. 404 is reserved for a missing id.",
      },
      {
        id: "q3",
        prompt: "If you do not catch `JsonRejection`, valid JSON of the wrong shape is which status?",
        choices: [
          { id: "a", text: "422 Unprocessable Entity." },
          { id: "b", text: "404 Not Found." },
          { id: "c", text: "201 Created." },
          { id: "d", text: "200 with `null`." },
        ],
        answer: "a",
        why: "That is Axum's default for `JsonDataError`. Broken JSON syntax, still unwrapped, is 400. A missing JSON content type is 415. We map all of them to 400 only when the handler sees the `Result`.",
      },
    ],
  },
];
