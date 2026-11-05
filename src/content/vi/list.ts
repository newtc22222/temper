import type { LessonPatch } from "../patches";

export const listVi: Record<string, LessonPatch> = {
  "state-and-the-lock": {
    title: "State và lock",
    summary:
      "Router sở hữu danh sách. Một request nhận clone rẻ của `Arc`, rồi mượn `Vec` cho một critical section.",
    blocks: [
      {
        text: "Danh sách phải sống lâu hơn một request, nên không thể là biến local trong handler. Nó nằm trong `AppState`. Router lưu giá trị đó bằng `.with_state`. `State<AppState>` clone nó vào mỗi lần gọi. Bound của `.with_state` là `AppState: Clone`.",
      },
      {
        caption: "`Note` là struct từ bài 05, có `Clone` và `Serialize`.",
      },
      {
        text: "Clone `AppState` là clone `Arc`, một owner dùng chung và một bộ đếm. Nó không clone `Vec`. Vì thế `State` rẻ. `Vec` ở nguyên chỗ. Mutex bọc nó nghĩa là mỗi lúc một guard. `lock` mượn danh sách chừng nào guard còn sống. Bạn đã biết một lần mượn phải kết thúc. Guard chính là lần mượn đó.",
      },
      {
        text: "Khóa này dùng `std::sync::Mutex`, không phải mutex của Tokio. Critical section không `.await`. Đừng thêm `.await` giữa `lock` và lúc drop guard. Không được giữ `std::sync::Mutex` qua điểm task yield.",
      },
      {
        caption:
          "Router kết thúc bằng `.with_state(AppState::new())`. `list_notes` được đăng ký với `get`.",
      },
      {
        text: "`.clone()` ở đây là clone của `Vec`, nhìn qua guard. Không phải clone của guard, cũng không phải clone `Arc` rẻ từ `State`. `Json` giữ giá trị và serialize sau khi hàm của bạn return, tức là sau khi guard drop. Một reference vào guard phải sống lâu bằng `Json` đó. Nó không thể. Clone này là một `Vec` bạn sở hữu, lấy ra lúc lần mượn vẫn còn hợp lệ.",
      },
      {
        title: "Poison",
        text: "`lock` trả về một `Result`. `expect` panic nếu mutex bị poison, điều chỉ xảy ra khi một thread panic lúc đang giữ guard. Các handler trong chương trình này không panic khi đang giữ nó. Poison không phải request mà bạn biến thành 400.",
      },
      {
        prompt: "Return nào sống lâu hơn guard? Cái kia không biên dịch.",
        why: "`Json` giữ thứ bạn đưa cho nó qua khỏi cuối hàm. `&*notes` mượn guard, và guard là biến local. Clone là một `Vec<Note>` được sở hữu. `Note: Clone` là lý do clone đó tồn tại. `State` đã clone `Arc` rẻ trước khi hàm chạy.",
      },
      {
        notes: ["Clone mỗi request. Kiểu phải là `Clone`."],
      },
    ],
    quiz: [
      {
        prompt: "Extract `State<AppState>` clone cái gì?",
        choices: [
          "`Arc` bên trong `AppState`. `Vec` ở nguyên chỗ.",
          "Cả `Vec`, trên mọi request, trước khi handler chạy.",
          "Socket.",
          "Body của request.",
        ],
        why: "`#[derive(Clone)]` trên struct của các `Arc` clone các con trỏ. Ý của `Arc` là clone này là một bộ đếm, không phải bản sao các ghi chú.",
      },
      {
        prompt: "Trong `list_notes`, `notes.clone()` sao chép cái gì?",
        choices: [
          "`Vec<Note>`, để `Json` sở hữu nó sau khi guard drop.",
          "Chỉ `Arc`, thêm một lần nữa.",
          "Chính guard.",
          "HTTP request.",
        ],
        why: "Guard deref thành `Vec`. `clone` của `Vec` cần `Note: Clone`. Bản sao được sở hữu đó là thứ response serialize.",
      },
      {
        prompt: "Handler này được phép `.await` ở đâu?",
        choices: [
          "Nó không `.await` khi guard còn sống.",
          "Ngay sau `lock`, trước khi đọc danh sách.",
          "Chỉ khi guard còn sống. Đó là điều `async` đòi hỏi.",
          "Trên chính `Vec`. `Vec` là một future.",
        ],
        why: "`std::sync::Mutex` được giữ trên một thread. Yield lúc đang giữ nó là lỗi khóa này không nhận. Hàm không có `.await` sau `lock`.",
      },
    ],
  },
  "create-and-list": {
    title: "Một danh sách ghi chú: tạo và liệt kê",
    summary:
      "Một binary. `POST /notes` push. `GET /notes` clone danh sách ra. Danh sách rỗng vẫn là 200.",
    blocks: [
      {
        text: "Đây là chương trình, trừ get-one, bài sau. Create parse body trước khi lock, nên 400 không cần danh sách. Id là `len + 1` trong lúc giữ guard, rồi ghi chú được push. Khóa này không xóa, nên length là một id an toàn. Lock gộp lần đọc và lần push thành một critical section: hai lần create không thể lấy cùng một id.",
      },
      {
        caption: "Danh sách dependency cho phần còn lại của khóa.",
      },
      {
        caption: "Một binary trọn vẹn. Nó biên dịch khi là file nguồn duy nhất.",
        outputLabel: "trao đổi",
      },
      {
        text: "`GET /notes` trên danh sách rỗng là `[]` và 200, không phải 404. Chưa thiếu gì. Bạn hỏi danh sách, và danh sách tồn tại. Nó chỉ đang rỗng. 404 là cho một id, ở bài sau.",
      },
      {
        text: 'serde kiểm tra hình dạng, không kiểm tra nội dung. `{"title":"","body":""}` là 201 với các chuỗi rỗng. Field JSON thừa bị bỏ qua, trừ khi sau này bạn thêm `#[serde(deny_unknown_fields)]`. Khóa này không thêm. Field thiếu vẫn là 400, qua map rejection.',
      },
      {
        title: "Clone lúc push",
        text: "`Vec` giữ một `Note`. Response cần một bản nữa, vì `Json` lấy ownership còn `Vec` giữ bản của nó. `note.clone()` trước push, rồi move `note` vào `Json`, là cách tách đó. `Note: Clone` đã có trên struct.",
      },
    ],
    quiz: [
      {
        prompt: "`GET /notes` khi chưa tạo gì thì trả về gì?",
        choices: [
          "200 và `[]`.",
          "404 và body rỗng.",
          "204 và không có body.",
          "400, vì danh sách rỗng.",
        ],
        why: "Danh sách có đó. Rỗng là một `Vec` hợp lệ. 404 bắt đầu khi bạn hỏi một id và `find` trả về `None`.",
      },
      {
        prompt: "Id mới được chọn khi nào?",
        choices: [
          "Trong lúc giữ guard, trước khi push.",
          "Do máy khách, trong JSON.",
          "Do `Path`, từ URL.",
          "Sau khi response đã được ghi.",
        ],
        why: "`notes.len() as u64 + 1` và `push` chung một guard, nên hai request không thể cùng đọc một length rồi cùng nhận id đó.",
      },
      {
        prompt: "Vì sao `?` chạy trước `lock` trong `create_note`?",
        choices: [
          "Body sai phải fail mà không đụng danh sách.",
          "Mutex là thứ parse JSON.",
          "`Arc` không biên dịch nếu lock trước.",
          "201 chỉ trả được trước khi lock.",
        ],
        why: "Rejection là về request, không phải về các ghi chú. Lock trước vẫn memory-safe ở đây, và sẽ là thứ tự sai.",
      },
    ],
  },
  "option-becomes-404": {
    title: "Lấy một ghi chú",
    summary:
      "`find` trả về `Option`. `None` thành 404. Segment không phải số thì không đi xa tới đó.",
    blocks: [
      {
        text: "Thêm một route vào binary của bài 08. `find` trả về `Option<&Note>`. `cloned` cần `Note: Clone` và tạo ra `Option<Note>`. `map(Json)` nâng nó thành `Option<Json<Note>>`. `ok_or` là phép chuyển `Result` bạn đã dùng: `None` thành `Err`, `Some` thành `Ok`. `Err(StatusCode::NOT_FOUND)` là 404 với body rỗng. `Ok(Json(note))` là 200 và ghi chú, vì status response của `Json` là 200.",
      },
      {
        caption:
          "Thêm route bên cạnh `/notes`. Handler dùng `Path` và `State`, thứ tự nào cũng được. Cả hai đều là part extractor.",
        outputLabel: "các response",
      },
      {
        text: "Bạn clone một ghi chú ra khỏi guard, không phải cả danh sách. Cùng lý do với `list_notes`: response phải sở hữu dữ liệu sau khi guard drop. Guard drop ở cuối hàm. Lúc đó `Json` đã sở hữu ghi chú.",
      },
      {
        title: "400 và 404 là hai lỗi khác nhau",
        text: "`GET /notes/salt` không bao giờ vào `get_note`. `Path<u64>` reject thành 400. `GET /notes/9` thì vào, danh sách được lock, `find` trả về `None`, và bạn chọn 404. Segment sai là extractor. Ghi chú thiếu là `Option` của bạn.",
      },
      {
        prompt: "Biểu thức nào biến ghi chú thiếu thành 404? Cái kia panic khi `None`.",
        why: "`ok_or` biến `None` thành `Err(StatusCode::NOT_FOUND)`, và đó là một response. `unwrap` trên `None` thì panic, và panic ở đây là 500. Cả hai đoạn đều type-check nếu `Option` là `Option<Json<Note>>`. Chỉ một trong hai là biên mà khóa này dùng. `unwrap` không phải chính sách cho ghi chú thiếu.",
      },
    ],
    quiz: [
      {
        prompt: "`GET /notes/9` khi 9 chưa được tạo thì trả về gì?",
        choices: [
          "404, từ `ok_or(StatusCode::NOT_FOUND)`.",
          "400, vì id bất tiện.",
          "200 và `null`.",
          "Một panic, vì `find` thất bại.",
        ],
        why: "Segment đã parse được. Danh sách không có id đó. `None` là trường hợp `Option` bình thường, map thành một status.",
      },
      {
        prompt: "`GET /notes/salt` trả về gì?",
        choices: [
          "400 từ `Path`, và `get_note` không chạy.",
          "404 từ `ok_or`.",
          "422 từ serde trên body.",
          "201, và một ghi chú có title salt.",
        ],
        why: "GET này không có body. Lỗi là path segment, trước handler, nên không thể là `Option` của bạn.",
      },
      {
        prompt: "`ok_or(StatusCode::NOT_FOUND)` làm gì với `None`?",
        choices: [
          "Nó thành `Err(StatusCode::NOT_FOUND)`.",
          "Nó thành `Ok` với một ghi chú rỗng.",
          "Nó lock mutex lần nữa.",
          "Nó serialize `None` thành `null` và trả 200.",
        ],
        why: "`Some(json)` thành `Ok(json)`. Bạn đã biết phép chuyển này. Phần mới là `Err(StatusCode)` là response Axum gửi được.",
      },
    ],
  },
};
