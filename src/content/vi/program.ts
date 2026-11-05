import type { LessonPatch } from "../patches";

export const programVi: Record<string, LessonPatch> = {
  "reading-the-trait-error": {
    title: "Đọc lỗi trait",
    summary:
      "Một bound là `Type: Trait`. Dòng `Handler` bên ngoài là lớp bọc. Bound bên trong là chỗ sửa.",
    blocks: [
      {
        text: "Khi một handler sai, rustc không nói máy chủ của bạn sai. Nó nói một trait bound không được thỏa. Bound được viết `Type: Trait`. Đọc nó như một câu: type này phải implement trait kia. Bạn không cần một chương về trait để sửa một dòng. Bạn cần đọc type nào, và trait nào.",
      },
      {
        text: "Bound đầu thường là một lớp bọc. Nó nói hàm của bạn không implement `Handler`. Điều đó đúng, và tự nó thì vô ích. Axum implement `Handler` cho một hàm khi các đối số là extractor, kiểu trả về implement `IntoResponse`, và kiểu state khớp với router. Đọc tiếp. Bound tiếp theo gọi tên chỗ không khớp thật sự.",
      },
      {
        caption:
          "Số dòng trên máy bạn sẽ khác. Bound thì không. Struct này không phải `AppState` từ bài 07.",
        outputLabel: "rustc",
      },
      {
        text: "`with_state` clone state cho mỗi request. Bound nói `Clone`, nên `Clone` là thứ cần sửa. Derive nó trên một struct sở hữu `Vec` thì biên dịch được, và nó sẽ copy mọi note trên mỗi request. Việc đó làm vừa compiler và trượt mất ý. State từ bài 07 chính là cách sửa mà bound đang chỉ: `#[derive(Clone)]`, với một `Arc<Mutex<...>>` bên trong, nên bản clone mà `State` thực hiện chỉ là một bộ đếm.",
      },
      { text: "Cùng thói quen, bound thứ hai" },
      {
        caption:
          "Rút gọn. Thân hàm không quan trọng. Kiểu trả về thì quan trọng.",
        outputLabel: "rustc",
      },
      {
        text: "Sửa đúng thứ mà bound gọi tên. Trả về `Json<Note>`, và derive `Serialize` nếu bound tiếp theo nói `Note: Serialize`. Một `Note` trần không phải response. Nếu lớp bọc phía trên dòng này vẫn nhắc `Handler`, bỏ qua nó cho đến khi bound bên trong biến mất.",
      },
      {
        title: "Dạng thứ ba, cùng cách đọc",
        text: "Hai body extractor, hoặc một `Json` không đứng cuối, cũng làm `Handler` thất bại. Ghi chú bên trong mới là chỗ nói body đã bị lấy, hoặc một type không phải extractor. Bạn vẫn không tự implement `Handler`. Bạn sửa chữ ký mà bound bên trong mô tả.",
      },
      {
        prompt:
          "Compiler nói `Handler` không được implement, và bên dưới, `AppState: Clone` không được implement. Bạn làm gì?",
        why: "Bạn không implement `Handler` cho state hay cho hàm của mình. Axum đã làm điều đó, cho các hàm, một khi `AppState: Clone` đúng và bản clone là bản rẻ. Bound bên trong mới là dòng cần xử lý.",
      },
    ],
    quiz: [
      {
        prompt: "Bạn đọc `AppState: Clone` thế nào?",
        choices: [
          "`AppState` phải implement `Clone`.",
          "`Clone` phải implement `AppState`.",
          "`Vec` đang rỗng.",
          "Request bị clone lên socket.",
        ],
        why: "Type nằm bên trái, trait bắt buộc nằm bên phải. Đó là toàn bộ ký hiệu mà khóa này cần.",
      },
      {
        prompt: "Bạn xử lý dòng nào trước?",
        choices: [
          "Bound bên trong, cái gọi tên trait còn thiếu.",
          "Chỉ chữ `Handler`, bằng cách tự viết trait.",
          "Lỗi nào dài nhất.",
          "Mã status, bằng cách trả về 500.",
        ],
        why: "`Handler` là lớp bọc Axum hiện ra vì `get` đòi một handler. `E0277` lồng bên trong nói thứ thật sự còn thiếu.",
      },
      {
        prompt: "Thay đổi nào thỏa `Note: IntoResponse`?",
        choices: [
          "Trả về `Json<Note>`, với `Serialize` trên `Note`.",
          "Derive `Copy` trên `Note`.",
          "Trả về `()` thay vào, và bỏ note.",
          "Bỏ `async` khỏi hàm.",
        ],
        why: "`Json<Note>` implement `IntoResponse` khi note serialize được. `Copy` không tạo ra response. `()` sẽ biên dịch được và gửi một 200 rỗng, tức là body sai.",
      },
    ],
  },
  "the-module-split": {
    title: "Tách module",
    summary:
      "`main` khởi động runtime. `notes` sở hữu các struct. `routes` sở hữu các handler. Cùng một chương trình.",
    blocks: [
      {
        text: "File đơn thì dài, không phải khéo. Tách nó theo cách bạn đã tách Rust. `main` khởi động Tokio và serve router. `notes` sở hữu các struct và constructor. `routes` sở hữu các handler và bảng route. Không có kiến trúc mới. Ba module, một binary.",
      },
      {
        caption: "Crate root của một binary là `main.rs`. `mod` khai báo hai file.",
      },
      {
        caption:
          "Các field là `pub` vì `routes` dựng một `Note` và lock danh sách. `Serialize` vẫn chạy.",
      },
      {
        caption: "Các handler vẫn private. `router` là public vì `main` gọi nó.",
      },
      {
        text: "`use crate::notes::{AppState, NewNote, Note}` là một path bình thường. `crate` là binary này. Các handler là private vì không gì bên ngoài `routes` gọi chúng. `pub fn router` tồn tại để `main` gọi tên được nó. `-> Router` là `Router<()>`, thứ mà `.with_state` tạo ra. `axum::serve` nhận được giá trị đó trực tiếp.",
      },
      {
        title: "Không phải global",
        text: "Đừng giấu danh sách trong một `lazy_static` hoặc một `Mutex` toàn process bên trong `notes`. Router sở hữu state, được tạo một lần trong `router`. Một router thứ hai, về sau, trong một test bạn tự viết, có thể nhận một state thứ hai. Một global thì không.",
      },
    ],
    quiz: [
      {
        prompt: "File nào định nghĩa `Note` và `AppState`?",
        choices: [
          "`src/notes.rs`",
          "`src/main.rs`",
          "`Cargo.toml`",
          "Client gửi JSON.",
        ],
        why: "`main` chỉ khởi động runtime. Dữ liệu nằm cạnh constructor của nó. Các handler nằm cạnh các route.",
      },
      {
        prompt: "Vì sao `router` public, còn các handler thì không?",
        choices: [
          "`main` gọi `router` từ module khác. Không gì gọi các handler ngoài Axum, bên trong module này.",
          "Axum từ chối một hàm trừ khi nó là `pub`.",
          "JSON đòi mọi hàm phải public.",
          "404 chỉ được trả từ các hàm public.",
        ],
        why: "Privacy là quy tắc module bạn đã biết. Axum gọi các handler theo giá trị từ `get` và `post` trong cùng module. Nó không cần chúng public.",
      },
      {
        prompt: "`router` trả về gì sau `.with_state`?",
        choices: [
          "Một `Router` mà state đã được lưu, nên `serve` nhận được nó.",
          "Một `Router` vẫn chờ bạn truyền `AppState` trên mỗi request.",
          "Chính `Vec`.",
          "Một `TcpListener`.",
        ],
        why: "`.with_state` tiêu thụ router đang chờ một `AppState` và trả lại một router không còn state nào để điền. Đó là giá trị mà `axum::serve` chạy.",
      },
    ],
  },
  "one-request": {
    title: "Đi một request",
    summary:
      "Từ socket đến response, một `POST /notes`, và không bước nào bạn chưa đọc.",
    blocks: [
      {
        text: "Không có type mới. Danh sách đang rỗng. Request là `POST /notes`, header `Content-Type: application/json`, body `{\"title\":\"Salt\",\"body\":\"Buy salt\"}`. Không gì trong lượt đi này panic.",
      },
      {
        items: [
          "Tokio đã chấp nhận kết nối TCP. Axum sở hữu socket đó. Code của bạn chưa chạy.",
          "Router khớp `POST /notes` với `create_note`. `GET /notes` là method khác trên cùng path, và đó không phải request này.",
          "`State` clone `AppState`. Bản clone đó là `Arc`. `Vec` không bị copy ở đây.",
          "`Json` kiểm tra content type, tiêu thụ body, và deserialize một `NewNote` bạn sở hữu. Buffer không còn. Nếu bước này thất bại, `map_err` của bạn trả về 400 và không bao giờ lấy lock.",
          "Handler lock, đọc `len + 1`, push một `Note`, và trả về `Ok((StatusCode::CREATED, Json(note)))`. `Vec` giữ một note. `Json` sở hữu note kia. Guard drop khi hàm trả về.",
          "`IntoResponse` ghi status 201, `content-type: application/json`, và note đã serialize. Axum ghi những byte đó xuống socket. Bạn thì không.",
        ],
      },
      {
        caption:
          "Response sau sáu điểm dừng đó. Một POST giống hệt lần hai trả về id 2, không phải 400. Chương trình này không coi title lặp lại là xung đột.",
      },
      { text: "Những gì bạn không làm" },
      {
        items: [
          "Bạn không đọc hay ghi socket.",
          "Bạn không ghép status line bằng tay.",
          "Bạn không dựng một enum lỗi.",
          "Bạn không mở cơ sở dữ liệu, và bạn không kiểm tra mật khẩu.",
          "Bạn không cấu hình Tokio ngoài `#[tokio::main]` và `axum::serve`.",
        ],
      },
      {
        text: "Thay thế thường gặp tiếp theo, ngoài khóa này, là một pool trong `AppState` thay cho `Arc<Mutex<Vec<Note>>>`. Hình dạng handler không đổi: extractor vào, một `Result` ra. Nếu bạn đọc được `create_note` từ các đối số đến `Ok` mà không bỏ bước, bạn đã có lớp mà khóa này dành cho. Khóa ngôn ngữ vẫn là khóa đã dạy bạn `Result`.",
      },
      {
        notes: [
          "Routing, extractor, và `serve`, bằng lời của chính crate.",
          "Lỗi mà khóa này ánh xạ thành 400, nếu sau này bạn muốn các trường hợp cụ thể.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "Ở POST này, `State` clone cái gì?",
        choices: [
          "`AppState`, nghĩa là `Arc`, không phải `Vec`.",
          "Các byte của body.",
          "Socket.",
          "Response, sau khi nó được ghi.",
        ],
        why: "Bản copy đắt của các note, nếu có, là `clone` tường minh khi bạn push và khi bạn list. `State` là bản rẻ, và nó xảy ra trước thân handler.",
      },
      {
        prompt: "Guard drop lúc nào, so với serialization?",
        choices: [
          "Khi `create_note` trả về. `Json` đã sở hữu note nó sẽ serialize.",
          "Trong lúc Axum đang ghi socket, vẫn giữ `Vec`.",
          "Nó không drop. Lock là của cả process.",
          "Trước khi body được parse.",
        ],
        why: "Biến cục bộ drop khi hàm trả về. `Json<Note>` được trả về đã được dựng trước, và nó không mượn guard. Serialization dùng note được sở hữu đó.",
      },
      {
        prompt:
          "Cùng POST đó đến lần nữa, sau khi lần đầu thành công. Trả về cái gì?",
        choices: [
          "201 và một note có id 2.",
          "400, vì title đã được dùng.",
          "404, vì create chỉ chạy được một lần.",
          "201 và một note khác có id 1.",
        ],
        why: "Không gì trong `create_note` nhìn các title đang có. Lock chỉ làm id tiếp theo là duy nhất. Chữ trùng là hai note.",
      },
    ],
  },
};
