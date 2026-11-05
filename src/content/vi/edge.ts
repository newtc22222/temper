import type { LessonPatch } from "../patches";

export const edgeVi: Record<string, LessonPatch> = {
  "change-one-field": {
    title: "Đổi một field",
    summary: "`PATCH` chỉ ghi những field đã tới. Field thiếu là `None`, và field đó giữ nguyên.",
    blocks: [
      {
        text: "`PUT` từ bài 14 thay cả hai chuỗi. Người gọi có title mới và muốn giữ body cũ thì không nên phải gửi lại body. `PATCH /notes/{id}` là request đó. `patch(patch_note)` nối vào cùng route với get, put, và delete. `patch` là `axum::routing::patch`. Axum vẫn chọn hàm từ method. Bạn không rẽ nhánh bên trong `replace_note`.",
      },
      {
        text: "Phần thân là một struct khác. Cả hai field đều là `Option<String>`. Với serde và JSON, field thiếu deserialize thành `None`, và JSON `null` cũng là `None`. Struct này không phân biệt được hai trường hợp đó. `Some` là một chuỗi có mặt, kể cả `\"\"`. Bạn không thêm `#[serde(default)]` ở đây. Trên field `Option`, khi không có deserializer riêng, field thiếu đã là `None`.",
      },
      {
        caption:
          "Nối `patch` vào route từ bài 14. `Json` vẫn đứng cuối. `?` vẫn chạy trước `lock`.",
        outputLabel: "exchange",
      },
      {
        text: "`if let Some` là toàn bộ chính sách. `None` không gán, nên chuỗi đang lưu giữ nguyên. `Some(\"\")` thì gán, nên chuỗi đang lưu thành rỗng. Đó không phải xóa. Xóa vẫn là `DELETE`. Id thiếu là 404, và `PatchNote` đã parse bị bỏ. Handler này không `push`. Tạo mới vẫn là `POST /notes`.",
      },
      {
        title: "Put vẫn thay cả hai",
        text: "`PUT` chỉ với một field là 400, vì `NewNote` đòi `title` và `body`. `PATCH` là route nhận một object thiếu field. Đừng biến `PUT` thành chỗ chèn giá trị mặc định. Hai method là hai hàm.",
      },
      {
        prompt: "JSON là `{}`. Đoạn nào để title đang lưu yên? Đoạn kia ghi một chuỗi rỗng.",
        why: "`{}` làm `title` thành `None`. `if let` bỏ qua phép gán. `unwrap_or_default` trên `None` đó là `\"\"`, và phép gán ghi nó xuống. Cả hai đoạn đều biên dịch. Chỉ một đoạn là chính sách cho field thiếu.",
      },
    ],
    quiz: [
      {
        prompt: "`PATCH /notes/1` với `{\"title\":\"Salt\"}` khi ghi chú 1 tồn tại. Body đang lưu thì sao?",
        choices: [
          "Nó giữ nguyên. JSON không có field `body`, nên `Option` đó là `None`.",
          "Nó thành `\"\"`, vì field thiếu là chuỗi rỗng.",
          "Handler trả 400, vì `body` là bắt buộc.",
          "Ghi chú bị xóa, vì object không đủ field.",
        ],
        why: "`PatchNote.body` là `Option<String>`. Field JSON thiếu là `None`. `if let` không gán, nên `String` đã nằm trong `Vec` giữ nguyên.",
      },
      {
        prompt: "`PATCH /notes/9` với object thiếu field nhưng hợp lệ, khi 9 chưa từng được lưu, trả về gì?",
        choices: [
          "404, và danh sách không đổi.",
          "201 và một ghi chú mới với id 9.",
          "204 và phần thân rỗng.",
          "200 và một ghi chú có các field kia rỗng.",
        ],
        why: "Phần thân đã parse, nên đây không phải 400. `find` trả về `None`. Handler trả `NOT_FOUND` và không `push`. Cùng quy tắc với `PUT`.",
      },
      {
        prompt: "`{\"title\":null}` nghĩa là gì với `title: Option<String>`?",
        choices: [
          "`None`, giống field thiếu. Title đang lưu giữ nguyên.",
          "`Some(\"null\")`.",
          "Một `JsonRejection`, vì `null` không phải chuỗi.",
          "`Some(\"\")`, nên title bị xóa trắng.",
        ],
        why: "Ánh xạ JSON của serde coi `null` là `None` cho `Option`. Field thiếu cũng là `None`. Handler này vì thế giữ title đang lưu trong cả hai trường hợp. Xóa trắng nó nghĩa là gửi `\"\"`.",
      },
    ],
  },
  "unknown-path": {
    title: "Đường dẫn không có",
    summary:
      "Không route nào khớp là fallback của bạn, 404. Đường dẫn đã có mà method sai là 405, và fallback không chạy.",
    blocks: [
      {
        text: "Bài 14 nói `PUT /notes` là 405, vì đường dẫn đó tồn tại và `PUT` không phải method của nó. Cùng quy tắc cho mọi method bạn không gắn. `DELETE /notes` là 405. `PATCH /notes` là 405. Các hàm ghi chú của bạn không chạy. `Router::fallback` cũng không chạy. Method router của Axum trả lời, và theo mặc định nó đặt header `Allow` liệt kê những method đường dẫn đó có.",
      },
      {
        text: "`Router::fallback` là trường hợp kia: đường dẫn không khớp gì. `GET /other` không phải `/notes` và không phải `/notes/{id}`. `.fallback(unknown)` chạy lúc đó. Handler trong chương trình này trả `StatusCode::NOT_FOUND`. Nó không nhận extractor. Nó không nhìn danh sách. 404 từ `get_note`, `replace_note`, `patch_note`, hoặc `delete_note` không phải hàm này. Những route đó đã khớp. Id thì thiếu, và bạn chọn 404.",
      },
      {
        caption:
          "`.fallback` đứng cùng các route, trước `.with_state`. `unknown` không lock, vì đường dẫn không khớp thì không có gì để tìm.",
        outputLabel: "responses",
      },
      {
        title: "Không gắn fallback cho method",
        text: "`MethodRouter::fallback` sẽ chạy khi đường dẫn đã có và method bạn không gắn. Khóa này không gọi nó. 405 mặc định là câu trả lời. `Router::fallback` chỉ dành cho đường dẫn không khớp.",
      },
      {
        prompt: "Request nào gọi `unknown`?",
        why: "`/other` không khớp route nào, nên fallback của router chạy. `DELETE /notes` khớp route `/notes`, chỉ có `GET` và `POST`. Đó là 405 từ method router. Fallback không phải cơ hội thứ hai sau 405.",
      },
    ],
    quiz: [
      {
        prompt: "`GET /other` trả về gì, và ai trả lời?",
        choices: [
          "404 từ `unknown`.",
          "405 từ method router.",
          "404 từ `get_note`.",
          "200 và `[]`, vì danh sách không có đường dẫn đó.",
        ],
        why: "Không gì được định tuyến. `.fallback(unknown)` là handler cho trường hợp đó, và nó trả `NOT_FOUND`. Danh sách không liên quan.",
      },
      {
        prompt: "`DELETE /notes` trả về gì?",
        choices: [
          "405, và `unknown` không chạy.",
          "404 từ `unknown`.",
          "204, vì danh sách không đổi.",
          "400, vì không có `{id}`.",
        ],
        why: "Đường dẫn `/notes` là một route. Nó chỉ có `GET` và `POST`. Method mà route không gắn là 405, trước mọi hàm của bạn, và fallback của router không được dùng.",
      },
      {
        prompt: "`GET /notes/9` khi không ghi chú nào có id 9. Hàm nào chạy?",
        choices: [
          "`get_note`. Route đã khớp, và chính nó trả 404.",
          "`unknown`, vì 404 luôn nghĩa là fallback.",
          "Không hàm nào. Axum biến id thiếu thành 405.",
          "`delete_note`, vì ghi chú vắng mặt.",
        ],
        why: "`/notes/{id}` khớp, và `GET` được gắn ở đó. `Path` đã parse 9. `find` trả về `None`. 404 đó là của handler, từ bài 09. Fallback không thấy nó.",
      },
    ],
  },
};
