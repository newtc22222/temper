import type { Lesson } from "../types";

export const edgeLessons: Lesson[] = [
  {
    slug: "change-one-field",
    number: 16,
    track: "edge",
    minutes: 8,
    title: "Change one field",
    summary: "`PATCH` writes only the fields that arrived. A missing field is `None`, and that field stays.",
    diagram: "body",
    blocks: [
      {
        type: "prose",
        text: "`PUT` from lesson 14 replaces both strings. A caller who has a new title and wants the old body left alone should not have to send the body back. `PATCH /notes/{id}` is that request. `patch(patch_note)` joins the same route as get, put, and delete. `patch` is `axum::routing::patch`. Axum still picks the function from the method. You do not branch inside `replace_note`.",
      },
      {
        type: "prose",
        text: "The body is a different struct. Both fields are `Option<String>`. With serde and JSON, a missing field deserializes as `None`, and JSON `null` is also `None`. This struct cannot tell those two apart. `Some` is a string that was present, including `\"\"`. You do not add `#[serde(default)]` here. On an `Option` field, without a custom deserializer, the missing field is already `None`.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "Chain `patch` on the route from lesson 14. `Json` stays last. The `?` still runs before `lock`.",
        code: `.route(
    "/notes/{id}",
    get(get_note).put(replace_note).patch(patch_note).delete(delete_note),
)

#[derive(Deserialize)]
struct PatchNote {
    title: Option<String>,
    body: Option<String>,
}

async fn patch_note(
    State(state): State<AppState>,
    Path(id): Path<u64>,
    body: Result<Json<PatchNote>, JsonRejection>,
) -> Result<Json<Note>, StatusCode> {
    let Json(patch) = body.map_err(|_| StatusCode::BAD_REQUEST)?;
    let mut notes = state.notes.lock().expect("notes lock");
    let Some(note) = notes.iter_mut().find(|note| note.id == id) else {
        return Err(StatusCode::NOT_FOUND);
    };
    if let Some(title) = patch.title {
        note.title = title;
    }
    if let Some(next) = patch.body {
        note.body = next;
    }
    Ok(Json(note.clone()))
}`,
        output: `PATCH /notes/1
{"title":"Salt"}

HTTP/1.1 200 OK

{"id":1,"title":"Salt","body":"Buy salt"}

PATCH /notes/1
{"title":""}
200 OK
{"id":1,"title":"","body":"Buy salt"}

PATCH /notes/9
{"title":"Salt"}
404 Not Found`,
        outputLabel: "exchange",
      },
      {
        type: "prose",
        text: "`if let Some` is the whole policy. `None` does not assign, so the stored string stays. `Some(\"\")` does assign, so the stored string becomes empty. That is not a delete. Delete stays `DELETE`. A missing id is 404, and the parsed `PatchNote` is dropped. This handler does not `push`. Create is still `POST /notes`.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Put still replaces both",
        text: "`PUT` with only one field is 400, because `NewNote` requires `title` and `body`. `PATCH` is the route that accepts a partial object. Do not make `PUT` start inserting defaults. The two methods are two functions.",
      },
      {
        type: "pick",
        prompt: "The JSON is `{}`. Which lines leave the stored title alone? The other writes an empty string.",
        a: {
          code: `if let Some(title) = patch.title {
    note.title = title;
}`,
        },
        b: {
          code: `note.title = patch.title.unwrap_or_default();`,
        },
        answer: "a",
        why: "`{}` makes `title` into `None`. The `if let` skips the assignment. `unwrap_or_default` on that `None` is `\"\"`, and the assignment writes it. Both snippets compile. Only one of them is the missing-field policy.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "`PATCH /notes/1` with `{\"title\":\"Salt\"}` when note 1 exists. What happens to the stored body?",
        choices: [
          { id: "a", text: "It stays. The JSON had no `body` field, so that `Option` is `None`." },
          { id: "b", text: "It becomes `\"\"`, because a missing field is an empty string." },
          { id: "c", text: "The handler returns 400, because `body` is required." },
          { id: "d", text: "The note is deleted, because the object was partial." },
        ],
        answer: "a",
        why: "`PatchNote.body` is `Option<String>`. A missing JSON field is `None`. The `if let` does not assign, so the `String` already in the `Vec` stays.",
      },
      {
        id: "q2",
        prompt: "`PATCH /notes/9` with a valid partial object, when 9 was never stored, returns what?",
        choices: [
          { id: "a", text: "404, and the list is unchanged." },
          { id: "b", text: "201 and a new note with id 9." },
          { id: "c", text: "204 and an empty body." },
          { id: "d", text: "200 and a note whose other fields are empty." },
        ],
        answer: "a",
        why: "The body parsed, so this is not a 400. `find` returned `None`. The handler returns `NOT_FOUND` and does not `push`. Same rule as `PUT`.",
      },
      {
        id: "q3",
        prompt: "What is `{\"title\":null}` for `title: Option<String>`?",
        choices: [
          { id: "a", text: "`None`, same as a missing field. The stored title stays." },
          { id: "b", text: "`Some(\"null\")`." },
          { id: "c", text: "A `JsonRejection`, because `null` is not a string." },
          { id: "d", text: "`Some(\"\")`, so the title is cleared." },
        ],
        answer: "a",
        why: "serde's JSON mapping treats `null` as `None` for `Option`. A missing field is also `None`. This handler therefore leaves the stored title in both cases. Clearing it means sending `\"\"`.",
      },
    ],
  },
  {
    slug: "unknown-path",
    number: 17,
    track: "edge",
    minutes: 7,
    title: "Unknown path",
    summary: "No matching route is your fallback, 404. A known path and the wrong method is 405, and the fallback does not run.",
    diagram: "miss",
    blocks: [
      {
        type: "prose",
        text: "Lesson 14 said `PUT /notes` is 405, because that path exists and `PUT` is not one of its methods. The same rule covers every method you did not install. `DELETE /notes` is 405. `PATCH /notes` is 405. Your note functions do not run. `Router::fallback` does not run either. Axum's method router answers, and by default it sets an `Allow` header listing the methods that path does have.",
      },
      {
        type: "prose",
        text: "`Router::fallback` is the other case: the path matches nothing. `GET /other` is not `/notes` and not `/notes/{id}`. `.fallback(unknown)` runs then. The handler in this program returns `StatusCode::NOT_FOUND`. It takes no extractor. It does not look at the list. A 404 from `get_note`, `replace_note`, `patch_note`, or `delete_note` is not this function. Those routes matched. The id was missing, and you chose 404.",
      },
      {
        type: "code",
        file: "src/main.rs",
        label: "fragment",
        caption: "`.fallback` sits with the routes, before `.with_state`. `unknown` does not lock, because an unmatched path has nothing to look up.",
        code: `let app = Router::new()
    .route("/notes", get(list_notes).post(create_note))
    .route(
        "/notes/{id}",
        get(get_note)
            .put(replace_note)
            .patch(patch_note)
            .delete(delete_note),
    )
    .fallback(unknown)
    .with_state(AppState::new());

async fn unknown() -> StatusCode {
    StatusCode::NOT_FOUND
}`,
        output: `GET /other
404 Not Found
(unknown runs)

DELETE /notes
405 Method Not Allowed
(unknown does not run)

GET /notes/9
404 Not Found
(get_note runs, unknown does not)`,
        outputLabel: "responses",
      },
      {
        type: "callout",
        tone: "note",
        title: "Leave the method fallback off",
        text: "`MethodRouter::fallback` would run for a known path and a method you did not install. This course does not call it. The default 405 is the answer. `Router::fallback` stays the unmatched path only.",
      },
      {
        type: "pick",
        prompt: "Which request calls `unknown`?",
        a: {
          code: `GET /other`,
        },
        b: {
          code: `DELETE /notes`,
        },
        answer: "a",
        why: "`/other` matches no route, so the router fallback runs. `DELETE /notes` matches the `/notes` route, whose methods are `GET` and `POST`. That is 405 from the method router. The fallback is not a second chance after 405.",
      },
    ],
    quiz: [
      {
        id: "q1",
        prompt: "`GET /other` returns what, and who answers?",
        choices: [
          { id: "a", text: "404 from `unknown`." },
          { id: "b", text: "405 from the method router." },
          { id: "c", text: "404 from `get_note`." },
          { id: "d", text: "200 and `[]`, because the list is empty of that path." },
        ],
        answer: "a",
        why: "Nothing was routed. `.fallback(unknown)` is the handler for that, and it returns `NOT_FOUND`. The list is not involved.",
      },
      {
        id: "q2",
        prompt: "`DELETE /notes` returns what?",
        choices: [
          { id: "a", text: "405, and `unknown` does not run." },
          { id: "b", text: "404 from `unknown`." },
          { id: "c", text: "204, because the list was not changed." },
          { id: "d", text: "400, because there is no `{id}`." },
        ],
        answer: "a",
        why: "The path `/notes` is a route. It has `GET` and `POST` only. A method that route does not install is 405, before any of your functions, and the router fallback is not used.",
      },
      {
        id: "q3",
        prompt: "`GET /notes/9` when no note has id 9. Which function runs?",
        choices: [
          { id: "a", text: "`get_note`. The route matched, and it returns 404 itself." },
          { id: "b", text: "`unknown`, because 404 always means the fallback." },
          { id: "c", text: "No function. Axum turns a missing id into 405." },
          { id: "d", text: "`delete_note`, because the note is absent." },
        ],
        answer: "a",
        why: "`/notes/{id}` matches, and `GET` is installed there. `Path` parsed 9. `find` returned `None`. That 404 is the handler's, from lesson 09. The fallback does not see it.",
      },
    ],
  },
];
