import type { LessonPatch } from "../patches";

export const bodyVi: Record<string, LessonPatch> = {
  "json-in": {
    title: "JSON vào, với serde",
    summary:
      "`Deserialize` trên một struct bạn đã hiểu. Body đã parse là của bạn. Thất bại là một `Result`.",
    blocks: [
      {
        text: "`NewNote` là một struct bình thường. `#[derive(Deserialize)]` bảo serde sinh code đọc các field đó từ JSON. Bạn không viết parser, và bạn không mở một chương về trait. Bạn đang nói cho derive biết những field nào tồn tại.",
      },
      {
        caption:
          "Thêm dòng này cạnh `axum` và `tokio`. Feature `derive` là thứ khiến attribute biên dịch được.",
      },
      {
        caption:
          'Import cho đoạn này: `axum::Json` và `serde::Deserialize`. Route là `.route("/notes", post(create_note))`.',
      },
      {
        text: "`Json<NewNote>` tiêu thụ body. Bạn nhận một `NewNote` bạn sở hữu. `title` và `body` là các `String` bạn sở hữu. Buffer của request không còn ở đó để mượn. Thiếu field, một số ở chỗ cần chuỗi, hoặc các byte không phải JSON: đó là một `JsonRejection`. Đó là `Err` của một `Result`. Deserialize không panic.",
      },
      {
        text: "`Json` đọc body, nên nó phải là đối số cuối khi các extractor khác xuất hiện. `State` và `Path` không đọc body, nên chúng đứng trước. Hai đối số `Json` không thể dùng chung một body. Body chỉ tiêu thụ được một lần.",
      },
      {
        title: "Content type",
        text: "Extractor cũng yêu cầu `Content-Type: application/json`, hoặc một type kết thúc bằng `+json`. Nếu thiếu header và bạn để `Json` không bọc, Axum từ chối request với 415. Vẫn không phải panic.",
      },
      {
        prompt:
          "Chữ ký nào sở hữu ghi chú đã parse? Cái kia không biên dịch: không còn request để mượn.",
        why: "`&NewNote` không phải extractor. Không có gì trong scope đang mượn body. `Json` parse các byte, bỏ buffer, và đưa cho bạn một struct được sở hữu.",
      },
      {
        notes: ["Tiêu thụ body. Cần `Deserialize`.", "Trait serde mà derive implement."],
      },
    ],
    quiz: [
      {
        prompt: "Sau `Json(new_note): Json<NewNote>`, bạn sở hữu gì?",
        choices: [
          "Một `NewNote`, gồm hai `String` của nó.",
          "Một lần mượn socket.",
          "Các byte body gốc, vẫn nằm trong request.",
          "Một mã status, và không gì khác.",
        ],
        why: "Việc của extractor là biến body thành một giá trị và đưa giá trị đó cho bạn. Buffer không sống lâu hơn lần parse.",
      },
      {
        prompt: 'Body là `{"title":"Salt"}` và thiếu `body`. Chuyện gì xảy ra?',
        choices: [
          "Một `JsonRejection`. Thân handler không thấy ghi chú.",
          "Một panic bên trong serde.",
          "`body` thành một `String` rỗng, và bạn trả về 200.",
          "Axum bỏ qua field và vẫn gọi handler.",
        ],
        why: "Hình dạng không khớp `NewNote`. Đó là một lần extract thất bại, một `Result`, không phải panic và không phải struct dựng dở.",
      },
      {
        prompt: "Vì sao `Json` đứng cuối danh sách đối số?",
        choices: [
          "Nó tiêu thụ body. Body chỉ lấy được một lần.",
          "Đối số bắt buộc phải theo bảng chữ cái.",
          "`State` bắt buộc đứng cuối.",
          "Để mã status được chọn trước.",
        ],
        why: "`Path` và `State` đọc các part, không đọc body, nên thứ tự giữa chúng là tự do. Extractor của body là cái cuối.",
      },
    ],
  },
  "json-out": {
    title: "JSON ra",
    summary: "`Serialize` là đường về. `Json<Note>` đặt content type và nhận ghi chú theo giá trị.",
    blocks: [
      {
        text: "Đường ra là cùng dạng struct, với `Serialize` thay cho `Deserialize`. `Json(note)` nhận ghi chú theo giá trị. Nó đặt `content-type: application/json` và serialize khi response được dựng. Một `Note` trần không implement `IntoResponse`. `Json<Note>` thì implement, và chỉ khi `Note: Serialize`.",
      },
      {
        caption:
          "Cần `use serde::Serialize` và `use axum::Json`. Handler này vừa đọc body vừa trả JSON. Nó chưa lưu gì.",
        outputLabel: "response",
      },
      {
        text: "`u64` thành một số JSON. `String` thành một chuỗi JSON. Tên field thành key. Method không phải field, nên không được serialize. Bạn move `title` và `body` từ `NewNote` sang `Note`. Đó là ownership bình thường. Rồi `Json` sở hữu `Note`.",
      },
      {
        title: "Nếu thiếu Serialize",
        text: 'Compiler không nói "JSON không vui." Nó nói `Note: Serialize` không được thỏa, hoặc `Json<Note>` không thể là response vì bound đó. Cách sửa là derive, không phải một kiểu trả về mới nghĩ ra cho lỗi.',
      },
      {
        prompt: "Kiểu trả về nào biên dịch được và gửi JSON?",
        why: "`Note` không implement `IntoResponse`. Bọc nó trong `Json` thì có, một khi đã derive `Serialize`. Status vẫn là 200 trừ khi bạn tự thêm `StatusCode`.",
      },
      {
        notes: ["Bound mà `Json<T>` cần trên đường ra."],
      },
    ],
    quiz: [
      {
        prompt: "`Json<Note>` đặt header nào?",
        choices: [
          "`content-type: application/json`",
          "`content-type: text/plain; charset=utf-8`",
          "`content-type: text/html`",
          "Không có content type. Client phải tự đoán.",
        ],
        why: "Header đó là một phần `IntoResponse` của `Json`. Trong khóa này bạn không đặt nó bằng tay.",
      },
      {
        prompt: "Vì sao `Note` derive `Serialize`?",
        choices: [
          "Để `Json<Note>` ghi được các field.",
          "Để `Path` parse được một id.",
          "Để mutex biên dịch được.",
          "Để clone được socket.",
        ],
        why: "`Deserialize` dành cho `NewNote` đi vào. JSON đi ra là `Serialize`. Đó là hai derive khác nhau, dù các field trông giống nhau.",
      },
      {
        prompt: "Trả về một `Note` trần từ handler thì không thỏa bound nào?",
        choices: [
          "`Note: IntoResponse`",
          "`Note: Clone`",
          "`Note: Default`",
          "`String: From<Note>`",
        ],
        why: "Kiểu trả về của handler phải trở thành một response. `Json<Note>` mới là response. `Note` chỉ là giá trị bên trong.",
      },
    ],
  },
  "result-and-status": {
    title: "Result và mã status",
    summary: "Ghi chú thiếu sẽ là 404. Body sai là 400. Không có tháp lỗi.",
    blocks: [
      {
        text: "`StatusCode` implement `IntoResponse`. `Result<T, StatusCode>` cũng vậy, khi `T` cũng implement. `Ok` trở thành response thành công. `Err(StatusCode::NOT_FOUND)` trở thành 404 với body rỗng. Khóa này không dựng một enum lỗi, không dựng hình dạng lỗi JSON, cũng không dựng một tháp middleware. Status chính là thông điệp.",
      },
      {
        text: "Body sai được xử lý bằng cách bọc extractor. `Result<Json<NewNote>, JsonRejection>` nghĩa là rejection đi vào hàm của bạn, thay vì Axum trả lời theo mặc định. Ánh xạ mọi rejection sang 400. Rồi `?` trả về status đó.",
      },
      {
        caption:
          "Danh sách chưa có ở đây, nên id cố định là 1. Các import gồm `JsonRejection`, `StatusCode`, `Json`, và hai struct.",
        outputLabel: "các response",
      },
      {
        text: "Nếu bạn để `Json<NewNote>` không bọc, Axum trả lời hộ bạn, và các status cụ thể hơn. Byte không phải JSON là 400. JSON không khớp struct là 422. Content type thiếu hoặc không phải JSON là 415. Khóa này ánh xạ cả ba sang 400 để body sai chỉ là một status ở biên. Tách chúng có thể để sau. Sau này bạn cũng không cần một type lỗi riêng để làm vậy. Bạn sẽ match trên `JsonRejection` thay vì bỏ nó bằng `_`.",
      },
      {
        text: "Ghi chú thiếu không phải body sai. Bài 09 biến `None` thành `StatusCode::NOT_FOUND`. Đừng dùng 400 cho trường hợp đó. 400 nghĩa là request không đọc được. 404 nghĩa là danh sách đọc được và id không có trong đó. 201 nghĩa là một ghi chú đã được lưu. 200, không kèm status thêm, là thứ `Json<T>` và `&'static str` đã trả về sẵn.",
      },
      {
        title: "Đừng unwrap rejection",
        text: "`unwrap` hoặc `expect` trên `Result` của extractor biến body sai thành một panic. Panic trong handler thành 500. Đó là status sai cho máy khách đã gửi JSON sai. Dùng `?`.",
      },
      {
        prompt: "Cả hai đoạn đều parse. Cái nào trả lời body sai bằng 400?",
        why: "`map_err` cùng `?` trả về `Err(StatusCode::BAD_REQUEST)` từ handler. `unwrap` panic, và máy khách thấy 500. Đoạn thứ hai cũng là status sai, kể cả khi nó chạy.",
      },
    ],
    quiz: [
      {
        prompt: "`Err(StatusCode::NOT_FOUND)` gửi body nào?",
        choices: [
          "Body rỗng, với status 404.",
          "Một object JSON bạn buộc phải thiết kế.",
          "Thông báo panic.",
          "Cả danh sách ghi chú.",
        ],
        why: "`StatusCode` khi làm response chỉ là status. Khóa này không nghĩ ra một payload lỗi.",
      },
      {
        prompt: "Trong khóa này, body không qua `Json<NewNote>` thành status nào?",
        choices: [
          "400, vì ta tự ánh xạ `JsonRejection`.",
          "404, vì ghi chú chưa được lưu.",
          "201, với một ghi chú rỗng.",
          "200, và handler tự chọn các field mặc định.",
        ],
        why: "Dòng `map_err` gộp lỗi cú pháp, lỗi hình dạng, và lỗi content type thành `BAD_REQUEST`. 404 dành riêng cho id thiếu.",
      },
      {
        prompt: "Nếu bạn không bắt `JsonRejection`, JSON hợp lệ nhưng sai hình dạng là status nào?",
        choices: ["422 Unprocessable Entity.", "404 Not Found.", "201 Created.", "200 với `null`."],
        why: "Đó là mặc định của Axum cho `JsonDataError`. Cú pháp JSON hỏng, vẫn không bọc, là 400. Thiếu content type JSON là 415. Ta ánh xạ tất cả sang 400 chỉ khi handler thấy `Result`.",
      },
    ],
  },
};
