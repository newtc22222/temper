export const signatures: { title: string; code: string; note: string }[] = [
  {
    title: "Text",
    note: "200, `text/plain; charset=utf-8`.",
    code: `async fn hello() -> &'static str {
    "notes"
}`,
  },
  {
    title: "One path segment",
    note: "Axum 0.8 braces. A bad segment is 400 before the function runs.",
    code: `async fn get_note(Path(id): Path<u64>) -> String {
    format!("note {id}")
}

// .route("/notes/{id}", get(get_note))`,
  },
  {
    title: "JSON in, last",
    note: "`Json` consumes the body. `State` comes first.",
    code: `async fn create_note(
    State(state): State<AppState>,
    Json(new_note): Json<NewNote>,
) -> Json<Note> {
    // ...
}`,
  },
  {
    title: "Bad body as 400",
    note: "Every `JsonRejection` maps to one status. No error enum.",
    code: `async fn create_note(
    body: Result<Json<NewNote>, JsonRejection>,
) -> Result<(StatusCode, Json<Note>), StatusCode> {
    let Json(new_note) = body.map_err(|_| StatusCode::BAD_REQUEST)?;
    // ...
}`,
  },
  {
    title: "Missing note as 404",
    note: "`None` is the missing id. The body of a bare status is empty.",
    code: `notes
    .iter()
    .find(|note| note.id == id)
    .cloned()
    .map(Json)
    .ok_or(StatusCode::NOT_FOUND)`,
  },
  {
    title: "State",
    note: "The clone `State` makes is the `Arc`. The `Vec` clone is the one you write.",
    code: `#[derive(Clone)]
struct AppState {
    notes: Arc<Mutex<Vec<Note>>>,
}

async fn list_notes(State(state): State<AppState>) -> Json<Vec<Note>> {
    let notes = state.notes.lock().expect("notes lock");
    Json(notes.clone())
}`,
  },
  {
    title: "Router and serve",
    note: "`.fallback` then `.with_state`, then `serve`. `unwrap` here is process startup, not a request.",
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

let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
    .await
    .unwrap();
axum::serve(listener, app).await.unwrap();`,
  },
  {
    title: "Delete",
    note: "204 has no body. `None` from `position` is 404.",
    code: `async fn delete_note(
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
  },
  {
    title: "Replace",
    note: "The id stays the path id. `Json` is last. A missing note is not created.",
    code: `async fn replace_note(
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
  },
  {
    title: "Query",
    note: "Does not read the body. A missing `title` is `None`.",
    code: `async fn list_notes(
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
  },
  {
    title: "Patch",
    note: "A missing field is `None` and stays as stored. `Json` is last. A missing id is not created.",
    code: `async fn patch_note(
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
  },
  {
    title: "Fallback",
    note: "Unmatched path only. A known path and the wrong method is 405, and this function does not run.",
    code: `let app = Router::new()
    .route("/notes", get(list_notes).post(create_note))
    .fallback(unknown)
    .with_state(AppState::new());

async fn unknown() -> StatusCode {
    StatusCode::NOT_FOUND
}`,
  },
];

export const statuses: { code: string; when: string; who: string }[] = [
  {
    code: "200",
    when: "`GET /notes`, including `[]`. A returned `&'static str`. `Json<T>` with no status beside it.",
    who: "You returned a value. Axum wrote 200.",
  },
  {
    code: "201",
    when: "`POST /notes` stored a note. The body is that note as JSON.",
    who: "You returned `StatusCode::CREATED` with `Json(note)`.",
  },
  {
    code: "204",
    when: "`DELETE /notes/{id}` removed a note. The body is empty.",
    who: "You returned `StatusCode::NO_CONTENT`.",
  },
  {
    code: "400",
    when: "The `{id}` segment is not a `u64`, the query string does not fit `ListQuery`, or the handler mapped `JsonRejection` to `BAD_REQUEST`.",
    who: "`Path` and `Query`, by default. Or your `map_err`.",
  },
  {
    code: "404",
    when: "The segment parsed, and no note has that id. The body is empty.",
    who: "You turned `None` into `StatusCode::NOT_FOUND`.",
  },
  {
    code: "405",
    when: "The path matches a route, and that route has no handler for the method. `DELETE /notes` is this, because `/notes` only has `GET` and `POST`.",
    who: "Axum's method router. Your handler does not run, and neither does `fallback`.",
  },
  {
    code: "415",
    when: "You left `Json<T>` unwrapped, and the content type is not JSON. This course maps that case to 400 instead.",
    who: "Axum's `JsonRejection`, only if you do not catch it.",
  },
  {
    code: "422",
    when: "You left `Json<T>` unwrapped, and the JSON does not match the struct. This course maps that case to 400 instead.",
    who: "Axum's `JsonRejection`, only if you do not catch it.",
  },
  {
    code: "500",
    when: "A panic, including `unwrap` on a rejection or on `None`. Not a status this program returns on purpose.",
    who: "The runtime, after a panic. Do not use it as a policy.",
  },
];
