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
    note: "`.with_state` first. `unwrap` here is process startup, not a request.",
    code: `let app = Router::new()
    .route("/notes", get(list_notes).post(create_note))
    .route("/notes/{id}", get(get_note))
    .with_state(AppState::new());

let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
    .await
    .unwrap();
axum::serve(listener, app).await.unwrap();`,
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
    code: "400",
    when: "The `{id}` segment is not a `u64`, or the handler mapped `JsonRejection` to `BAD_REQUEST`.",
    who: "`Path`, by default. Or your `map_err`.",
  },
  {
    code: "404",
    when: "The segment parsed, and no note has that id. The body is empty.",
    who: "You turned `None` into `StatusCode::NOT_FOUND`.",
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
