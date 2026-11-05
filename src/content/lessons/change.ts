import type { Lesson } from "../types";

export const changeLessons: Lesson[] = [
  {
    slug: "delete-one-note",
    number: 13,
    track: "change",
    minutes: 8,
    title: "Delete one note",
    summary: "`DELETE` uses the same path as get. A found index is removed. `None` is still 404.",
    diagram: "option",
    blocks: [
      {
        type: "prose",
        text: "The program so far can create, list, and get. Deleting is the same path as get, and a different method. `get(get_note).delete(delete_note)` on `/notes/{id}` sends `DELETE` to a new function. `GET` still goes to `get_note`. Axum picks the function from the method. You do not branch on the method inside one handler.",
      },
      {
        type: "prose",
        text: "`position` returns `Option<usize>`, the index of the first note with that id, or `None`. `None` is 404, same policy as get, and the body is empty because you return a bare `StatusCode`. A found index is `notes.remove(index)`. `remove` gives back the `Note`. You drop it. Nothing in the response needs it. `StatusCode::NO_CONTENT` is 204. A 204 has no body. `Path<u64>` still rejects `/notes/salt` as 400 before `delete_note` runs.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "Replace the get-only route from lesson 09. `delete` is `axum::routing::delete`. `State` and `Path` may sit in either order. Neither reads the body.",
        code: `.route("/notes/{id}", get(get_note).delete(delete_note))

async fn delete_note(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> StatusCode {
    let mut notes = state.notes.lock().expect("notes lock");
    let Some(index) = notes.iter().position(|note| note.id == id) else {
        return StatusCode::NOT_FOUND;
    };
    notes.remove(index);
    StatusCode::NO_CONTENT
}`,
        output: `DELETE /notes/1
204 No Content

DELETE /notes/9
404 Not Found

DELETE /notes/salt
400 Bad Request
(delete_note does not run)`,
        outputLabel: "responses",
      },
      {
        type: "prose",
        text: "Lesson 08 chose the next id with `notes.len() as u64 + 1`. That is sound while you only push. After a delete it is not. Two notes, ids 1 and 2, delete 2, and `len` is 1, so the next create claims id 2 again. Two notes then share an id, and get returns whichever `find` sees first. Change the line inside `create_note`, still under the same guard as `push`.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "Replace `id: notes.len() as u64 + 1` in `create_note`. `max` on an empty iterator is `None`, and `unwrap_or(0)` makes the first id 1.",
        code: `let id = notes.iter().map(|note| note.id).max().unwrap_or(0) + 1;
let note = Note {
    id,
    title: new_note.title,
    body: new_note.body,
};`,
      },
      {
        type: "callout",
        tone: "note",
        title: "The guard is mut",
        text: "`remove` changes the `Vec`, so the lock is `let mut notes`. Get and list stay `let notes`. You still do not `.await` while the guard is alive. The guard drops at the end of the function, after `remove` and after you have built the status.",
      },
      {
        type: "pick",
        prompt: "Which deletion is a 404 for a missing id? The other panics.",
        a: {
          code: `let Some(index) = notes.iter().position(|note| note.id == id) else {
    return StatusCode::NOT_FOUND;
};
notes.remove(index);
StatusCode::NO_CONTENT`,
        },
        b: {
          code: `let index = notes.iter().position(|note| note.id == id).unwrap();
notes.remove(index);
StatusCode::NO_CONTENT`,
        },
        answer: "a",
        why: "`position` is an `Option`. `None` means the id is not in the list, which this program answers with 404. `unwrap` on that `None` panics, and a panic is a 500. Both snippets compile when the id is present. Only one of them is the missing-id policy.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "`DELETE /notes/1` when note 1 exists returns what?",
        choices: [
          { id: "a", text: "204 and an empty body." },
          { id: "b", text: "200 and the deleted note as JSON." },
          { id: "c", text: "201, because the list changed." },
          { id: "d", text: "404, because the note is now gone." },
        ],
        answer: "a",
        why: "`StatusCode::NO_CONTENT` is 204. The note was found and removed. 404 is only the `None` branch, before `remove`.",
      },
      {
        id: "q2",
        prompt: "Why does `delete_note` not return `Json<Note>`?",
        choices: [
          { id: "a", text: "The response does not need a body. `remove` already took the note out of the list." },
          { id: "b", text: "`Json` cannot be returned from a `DELETE` handler." },
          { id: "c", text: "`Note` does not implement `Clone`." },
          { id: "d", text: "The lock forbids moving a `Note`." },
        ],
        answer: "a",
        why: "204 means the method worked and there is nothing to read back. You could return the note, and this program does not. The dropped `Note` from `remove` is the one that left the `Vec`.",
      },
      {
        id: "q3",
        prompt: "After a delete, why is `len + 1` the wrong next id?",
        choices: [
          { id: "a", text: "`len` is how many notes remain, not the highest id that was ever used." },
          { id: "b", text: "`len` does not compile on a `Vec<Note>`." },
          { id: "c", text: "Axum resets every id to 0 after `DELETE`." },
          { id: "d", text: "`Mutex` forbids reading `len`." },
        ],
        answer: "a",
        why: "Deleting the last note makes `len` smaller while the earlier ids stay. The next id has to be one past the greatest id still stored, which is what `max` reads, under the same lock as `push`.",
      },
    ],
  },
  {
    slug: "replace-one-note",
    number: 14,
    track: "change",
    minutes: 8,
    title: "Replace one note",
    summary: "`PUT` keeps the id from the path and writes a new title and body. A bad body is still 400.",
    diagram: "body",
    blocks: [
      {
        type: "prose",
        text: "`PUT /notes/{id}` replaces the title and the body of one note. The id does not move. It is the `Path<u64>`, not a field in the JSON. The body is the same `NewNote` as create: `title` and `body`, both strings. `POST /notes` still creates. `PUT` on the collection path is not a route in this program, so Axum answers that method with 405 and your function does not run.",
      },
      {
        type: "prose",
        text: "`Json` is last, as in lesson 04. `State` and `Path` do not read the body, so they may lead. A bad body is `JsonRejection`, mapped to 400, and the `?` runs before `lock`. A good body and a missing id is 404. You looked the note up. It was not there. The parsed `NewNote` is dropped with the function. You do not insert it.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "Chain `put` on the same route as get and delete. `put` is `axum::routing::put`. `JsonRejection` is the same type lesson 06 mapped.",
        code: `.route(
    "/notes/{id}",
    get(get_note).put(replace_note).delete(delete_note),
)

async fn replace_note(
    State(state): State<AppState>,
    Path(id): Path<u64>,
    body: Result<Json<NewNote>, JsonRejection>,
) -> Result<Json<Note>, StatusCode> {
    let Json(new_note) = body.map_err(|_| StatusCode::BAD_REQUEST)?;
    let mut notes = state.notes.lock().expect("notes lock");
    let Some(note) = notes.iter_mut().find(|note| note.id == id) else {
        return Err(StatusCode::NOT_FOUND);
    };
    note.title = new_note.title;
    note.body = new_note.body;
    Ok(Json(note.clone()))
}`,
        output: `PUT /notes/1
content-type: application/json

{"title":"Salt","body":"Buy more"}

HTTP/1.1 200 OK
content-type: application/json

{"id":1,"title":"Salt","body":"Buy more"}

PUT /notes/9
{"title":"Salt","body":"Buy more"}
404 Not Found

PUT /notes/1
{"title":"Salt"}
400 Bad Request`,
        outputLabel: "exchange",
      },
      {
        type: "prose",
        text: "`iter_mut` borrows the stored note. The two assignments move the new strings into that note. The `Vec` still owns it. `Json` needs an owned `Note` after the guard drops, so `note.clone()` is the copy that leaves. The id field is never assigned. A JSON object with an extra `id` field is still accepted: serde ignores unknown fields, as in lesson 08, and the path id wins.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Put does not create",
        text: "If the id is missing, this handler returns 404. It does not push. Create stays `POST /notes`, which chooses the id. A client that sends `PUT` for a new id gets 404, even when the JSON is well formed.",
      },
      {
        type: "pick",
        prompt: "Which signature can compile? `Json` reads the body.",
        a: {
          code: `async fn replace_note(
    State(state): State<AppState>,
    Path(id): Path<u64>,
    Json(new_note): Json<NewNote>,
) -> Json<Note>`,
        },
        b: {
          label: "fails",
          code: `async fn replace_note(
    Json(new_note): Json<NewNote>,
    Path(id): Path<u64>,
) -> Json<Note>`,
        },
        answer: "a",
        why: "`Json` consumes the body, so it is the last extractor. `Path` after `Json` is the same failure as lesson 04: the body was already taken. The `Result<Json<_>, JsonRejection>` form in the lesson is the same order, with the rejection mapped to 400.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Where does the id of a replaced note come from?",
        choices: [
          { id: "a", text: "The `{id}` segment, parsed by `Path`." },
          { id: "b", text: "A field named `id` in the JSON body." },
          { id: "c", text: "`notes.len()`, again." },
          { id: "d", text: "The `Arc` count." },
        ],
        answer: "a",
        why: "`NewNote` has `title` and `body`. The stored `id` is the one `Path` already parsed. The assignments do not touch it.",
      },
      {
        id: "q2",
        prompt: "`PUT /notes/9` with a valid JSON body, when 9 was never stored, returns what?",
        choices: [
          { id: "a", text: "404, and the list is unchanged." },
          { id: "b", text: "201 and a new note with id 9." },
          { id: "c", text: "204 and an empty list." },
          { id: "d", text: "400, because the id is unused." },
        ],
        answer: "a",
        why: "The body parsed, so this is not a 400. `find` returned `None`. The handler returns `NOT_FOUND` and does not `push`.",
      },
      {
        id: "q3",
        prompt: "Why is the `?` on the body before `lock`?",
        choices: [
          { id: "a", text: "A bad body should fail without borrowing the list." },
          { id: "b", text: "The mutex parses JSON." },
          { id: "c", text: "`Path` only works after a lock." },
          { id: "d", text: "200 cannot be returned if you lock first." },
        ],
        answer: "a",
        why: "The rejection is about the request body. The list is not involved until the struct exists. This is the same order as `create_note`.",
      },
    ],
  },
  {
    slug: "filter-with-query",
    number: 15,
    track: "change",
    minutes: 8,
    title: "Filter with a query",
    summary: "`Query` reads `?title=`, not the body. A missing key is `None`, and the list stays whole.",
    diagram: "query",
    blocks: [
      {
        type: "prose",
        text: "`GET /notes` returns every note. A caller who wants one title adds a query string: `GET /notes?title=Salt`. That string is not the body and not a path segment. `axum::extract::Query` deserializes it. `Query` implements `FromRequestParts`, so it does not consume a body. It may sit beside `State` in either order. This handler has no `Json`.",
      },
      {
        type: "prose",
        text: "The struct is one optional field. `#[derive(Deserialize)]` is the same derive as `NewNote`. A missing `title` key is `None`, not an error, and the filter keeps every note. `?title=Salt` is `Some`, and the filter keeps notes whose `title` is equal to that `String`. An extra key is ignored, the same serde default as lesson 08. You do not add `deny_unknown_fields`.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "This replaces `list_notes` from lesson 08. Add `use axum::extract::Query`. `as_deref` turns `Option<String>` into `Option<&str>`, so the comparison borrows. The route stays `get(list_notes).post(create_note)` on `/notes`.",
        code: `#[derive(Deserialize)]
struct ListQuery {
    title: Option<String>,
}

async fn list_notes(
    State(state): State<AppState>,
    Query(params): Query<ListQuery>,
) -> Json<Vec<Note>> {
    let notes = state.notes.lock().expect("notes lock");
    let kept: Vec<Note> = notes
        .iter()
        .filter(|note| match params.title.as_deref() {
            Some(title) => note.title == title,
            None => true,
        })
        .cloned()
        .collect();
    Json(kept)
}`,
        output: `GET /notes
200 OK
[{"id":1,"title":"Salt","body":"Buy salt"},{"id":2,"title":"Oil","body":"One tin"}]

GET /notes?title=Salt
200 OK
[{"id":1,"title":"Salt","body":"Buy salt"}]

GET /notes?title=Pepper
200 OK
[]`,
        outputLabel: "responses",
      },
      {
        type: "prose",
        text: "No match is 200 and `[]`, not 404. You asked for the list. The list exists and happens to contain nothing with that title. 404 remains the answer for one id that `find` does not see. If the query string cannot be deserialized into `ListQuery`, `Query` rejects the request with 400 and `list_notes` does not run. A missing key is not that failure. `QueryRejection` is the type, the same shape of fact as `PathRejection`. This lesson does not map it. The default 400 is the one you want.",
      },
      {
        type: "callout",
        tone: "note",
        title: "The lock still ends",
        text: "`kept` is a new `Vec` of cloned notes. `Json` owns that vec. The guard can drop at the end of the function. You did not return a borrow of the list inside the mutex.",
      },
      {
        type: "pick",
        prompt: "`GET /notes` with no question mark. What is `params.title`?",
        a: {
          code: `None`,
        },
        b: {
          code: `Some("")`,
        },
        answer: "a",
        why: "The key is absent, so serde fills `Option` with `None`, and the filter keeps every note. `Some(\"\")` would be the value of `?title=` with nothing after the equals sign, which is a present key. An absent key and an empty value are not the same.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "What does `Query` read?",
        choices: [
          { id: "a", text: "The query string, such as `?title=Salt`." },
          { id: "b", text: "The JSON body." },
          { id: "c", text: "The `{id}` path segment." },
          { id: "d", text: "The `Arc` inside `AppState`." },
        ],
        answer: "a",
        why: "`Query` is a parts extractor. It deserializes the URI query. `Json` is what reads the body. `Path` is the segment.",
      },
      {
        id: "q2",
        prompt: "`GET /notes?title=Pepper` when no note is titled Pepper returns what?",
        choices: [
          { id: "a", text: "200 and `[]`." },
          { id: "b", text: "404 and an empty body." },
          { id: "c", text: "400, because the title is unknown." },
          { id: "d", text: "204, because the filter removed them." },
        ],
        answer: "a",
        why: "The list request succeeded. Nothing matched. Empty is a valid `Vec`, the same answer as an empty list in lesson 08. 404 is for one missing id.",
      },
      {
        id: "q3",
        prompt: "Why may `Query` stand before or after `State`?",
        choices: [
          { id: "a", text: "Neither extractor reads the body." },
          { id: "b", text: "`Query` consumes the body, but `State` puts it back." },
          { id: "c", text: "Serde requires `Query` to be first." },
          { id: "d", text: "The mutex parses the query string." },
        ],
        answer: "a",
        why: "Both are parts extractors. Order between them is not the body rule. The body rule still puts `Json` last, and this handler has no `Json`.",
      },
    ],
  },
];
