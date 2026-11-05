import type { LessonPatch } from "../patches";

export const requestVi: Record<string, LessonPatch> = {
  "what-the-framework-owns": {
    title: "Những gì framework sở hữu",
    summary: "Handler là một hàm (function). Framework sở hữu socket. Bạn sở hữu các giá trị bạn trả về.",
    blocks: [
      {
        text: "Một web service là một hàm do framework gọi, cộng với một socket bạn không muốn sở hữu. Bạn đã biết cách sở hữu một `Vec` và cách trả về một `Result`. Axum không yêu cầu bạn học một ngôn ngữ thứ hai. Nó yêu cầu bạn đặt hàm đó ở nơi request tới được.",
      },
      {
        text: "Framework sở hữu TCP socket, vòng lặp nhận kết nối, bảng chọn hàm nào chạy, và việc ghi dòng trạng thái cùng các header. Bạn sở hữu các giá trị bạn trả về, các ghi chú bạn giữ trong `State`, và quyết định rằng ghi chú không tìm thấy là 404. Bạn không bao giờ ghi vào socket. Khi handler của bạn trả về, Axum biến giá trị đó thành các byte.",
      },
      { text: "Nó đang yêu cầu gì" },
      {
        items: [
          "Đưa cho nó một hàm. Hàm đó là handler.",
          "Để nó biến request thành các đối số. Những đối số đó là extractor: `Path`, `Json`, `State`.",
          "Trả về một giá trị mà nó đã biết cách gửi. Một string, một mã trạng thái, hoặc `Json<T>`.",
        ],
      },
      {
        title: "Tokio, một lần",
        text: "Axum không buộc bạn cấu hình async runtime. `#[tokio::main]` khởi động Tokio, `TcpListener::bind` nhận một port, và `axum::serve` giao từng kết nối cho router. Đó là toàn bộ Tokio trong khóa này. Runtime đã chạy khi handler của bạn được gọi. Bạn sẽ không spawn task, và bạn sẽ không đọc về `Pin`.",
      },
      {
        title: "Một framework",
        text: "Khóa này không đề cập Actix, Rocket, Leptos, hay Yew. Nó không deploy, và không mở cơ sở dữ liệu (database). Chương trình ở cuối là một danh sách trong bộ nhớ: tạo một ghi chú, liệt kê các ghi chú, lấy một ghi chú.",
      },
      { notes: ["Crate mà khóa này ở trong."] },
    ],
    quiz: [
      {
        prompt: "Ai sở hữu TCP socket?",
        choices: [
          "Axum, cho toàn bộ kết nối.",
          "Handler của bạn, vì nó trả về response.",
          "serde, vì nó đọc body.",
          "`Vec` các ghi chú.",
        ],
        why: "Handler trả về một giá trị. Axum ghi giá trị đó vào kết nối mà nó đã nhận. Bạn không giữ socket.",
      },
      {
        prompt: "Handler là gì?",
        choices: [
          "Một hàm Axum gọi khi một route khớp.",
          "Một trait bạn tự implement cho từng route.",
          "Kiểu của socket.",
          "Một Cargo feature bạn bật cho JSON.",
        ],
        why: "Bạn không tự implement trait `Handler`. Axum implement nó cho những hàm có đối số là extractor và giá trị trả về có thể thành response.",
      },
      {
        prompt: "Tokio làm gì trong khóa này?",
        choices: [
          "Nó là runtime mà Axum khởi động sẵn.",
          "Nó là một HTTP framework thứ hai, dùng bên cạnh Axum.",
          "Nó là kiểu của một handler.",
          "Nó lưu các ghi chú.",
        ],
        why: "`#[tokio::main]` và `axum::serve` là phần Tokio duy nhất bạn viết. Sau đó, runtime đã chạy.",
      },
    ],
  },
  "a-handler-that-returns-text": {
    title: "Một handler trả về text",
    summary: "Handler nhỏ nhất là một hàm async trả về một string. Axum đã biết cách gửi nó.",
    blocks: [
      {
        text: "`&'static str` là text tồn tại suốt chương trình. Axum implement `IntoResponse` cho nó, nên trả về string là đủ. Bạn không dựng response object, và không đặt header.",
      },
      {
        caption:
          "Ba feature của Tokio, không thêm feature nào: macros cho attribute, một runtime, và các kiểu mạng.",
      },
      {
        caption: "Cả một binary. `hello` là handler. `main` chỉ bind một port và serve router.",
        outputLabel: "response",
      },
      {
        text: "`routing::get(hello)` đăng ký hàm. `get` kiểm tra một bound. Đọc nó như một câu: hàm này có thể là một handler. Bạn không viết bound. Bạn viết `async fn`, các đối số là extractor, và một kiểu trả về có thể là response. Hàm này không có đối số. Một string là một response.",
      },
      {
        text: "Thân hàm `hello` không await gì. Axum cũng chấp nhận một `fn` thường ở đây. Khóa này vẫn viết `async fn`, để các handler sau có cùng dạng. Phần chờ trong chương trình này nằm ở `main` (`bind` và `serve`) và bên trong extractor. Extractor chạy trước khi vào hàm của bạn.",
      },
      {
        title: "Trả về rỗng vẫn là một response",
        text: "`()` implement `IntoResponse` dưới dạng một 200 rỗng. Quên string không phải lỗi compiler. Đó là một body trống. Trả về đúng text bạn định gửi.",
      },
      {
        prompt: "Đăng ký nào biên dịch được? Cái còn lại là một hàm thật, và không phải handler.",
        why: "Handler không nhận socket. `TcpListener` không phải extractor, nên `get(hello)` không thỏa mãn `Handler`. Framework đã sở hữu listener, ở phía trên trong `main`.",
      },
      { notes: ["Bound của giá trị trả về. Các string đã implement sẵn."] },
    ],
    quiz: [
      {
        prompt: "Trả về `&'static str` thì trên đường truyền có gì?",
        choices: [
          "Status 200 và `text/plain; charset=utf-8`.",
          "Status 200 và `application/json`.",
          "Status 404, vì handler không nhận path.",
          "Một panic, vì string không phải `Json`.",
        ],
        why: "`IntoResponse` của Axum cho một string là body plain-text và status 200. JSON là một kiểu trả về khác, `Json<T>`.",
      },
      {
        prompt: "`get(hello)` đang kiểm tra gì?",
        choices: [
          "Rằng `hello` có thể là một handler.",
          "Rằng port 3000 đang trống.",
          "Rằng string parse được thành JSON.",
          "Rằng bạn đã viết `impl Handler for hello`.",
        ],
        why: "Port được kiểm tra sau, lúc `bind`. `get` chỉ cần đối số và kiểu trả về vừa với một handler.",
      },
      {
        prompt: "Kết nối được nhận ở đâu?",
        choices: [
          "Trong `main`, bởi `axum::serve` trên listener.",
          "Bên trong `hello`, trước khi string được trả về.",
          "Bởi serde, khi body được đọc.",
          "Bởi `Clone`, khi router được dựng.",
        ],
        why: "`hello` trả về text. Nó không bao giờ thấy listener. `unwrap` trên `bind` hoặc `serve` dừng process nếu khởi động thất bại. Đó không phải một status của request.",
      },
    ],
  },
  "paths-and-path": {
    title: "Các path và Path",
    summary: "Router khớp một path. `Path<u64>` biến một segment thành số nguyên bạn sở hữu.",
    blocks: [
      {
        text: "Path của route là một string. Trong Axum 0.8, capture viết trong ngoặc nhọn: `/notes/{id}`. Dạng 0.7 với dấu hai chấm không phải cú pháp capture mà khóa này dùng. Ngoặc nhọn đặt tên segment trong route. Chúng không phải một binding của Rust.",
      },
      {
        text: "`Path<u64>` deserialize segment đó thành một số nguyên. Với một segment, kiểu primitive lấy text của segment. Binding của bạn là tên trong pattern: `Path(id)` gọi nó là `id` dù ngoặc nhọn ghi `{note_id}`. Bạn sở hữu `u64`. Bạn không giữ một slice của URL.",
      },
      {
        caption: "Dòng route nằm trên router, cạnh `hello`. Hàm có thể nằm cạnh nó.",
        outputLabel: "các response",
      },
      {
        text: "Segment không vừa `u64` là một `PathRejection`. Axum biến rejection đó thành 400 trước khi hàm của bạn bắt đầu. Bạn không `unwrap` một lần parse, và không nhìn path thô. Thất bại là một `Result` bên trong extractor, không phải một panic trong thân hàm.",
      },
      {
        title: "Nhiều hơn một segment",
        text: "Một `Path` có thể nhận nhiều capture: một tuple, theo thứ tự ngoặc nhọn, hoặc một struct có tên field khớp tên trong ngoặc và derive `Deserialize`. Khóa này chỉ cần một `u64`.",
      },
      {
        prompt: "Route nào capture một id trên Axum 0.8?",
        why: "Capture của 0.8 là `{id}`. Dấu hai chấm không phải dạng capture mà phiên bản này ghi trong tài liệu. Extractor và chuỗi route phải khớp, không thì segment không bao giờ thành một `u64`.",
      },
      { notes: ["Capture, tuple, và 400 khi segment sai."] },
    ],
    quiz: [
      {
        prompt: "Chuỗi path nào capture một id trong Axum 0.8?",
        choices: ["`/notes/{id}`", "`/notes/:id`", "`/notes/(id)`", "`/notes/<id>`"],
        why: "Capture dùng ngoặc nhọn. Dạng dấu hai chấm thuộc Axum 0.7, khóa này không viết.",
      },
      {
        prompt: "Điều gì xảy ra với `GET /notes/salt` nếu extractor là `Path<u64>`?",
        choices: [
          "400, và `get_note` không chạy.",
          "Handler chạy với `id` bằng 0.",
          "Handler panic vì parse thất bại.",
          "404, vì salt không có trong danh sách.",
        ],
        why: "Deserialize segment thất bại, nên Axum reject request. 404 là lựa chọn sau, cho một số đã parse được và không có trong danh sách.",
      },
      {
        prompt: "Trong `Path(id): Path<u64>`, `id` là gì?",
        choices: [
          "Binding của bạn. Handler sở hữu `u64`.",
          "Một borrow của socket, do ngoặc nhọn đặt tên.",
          "Một `&str` trỏ vào request line.",
          "Tên một field trên `State`.",
        ],
        why: "Pattern đặt tên cho biến (variable) cục bộ. `Path<u64>` đã parse segment thành một số nguyên. Không còn chuỗi request nào để borrow.",
      },
    ],
  },
};
