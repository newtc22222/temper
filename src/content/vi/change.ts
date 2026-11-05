import type { LessonPatch } from "../patches";

export const changeVi: Record<string, LessonPatch> = {
  "delete-one-note": {
    title: "Xóa một ghi chú",
    summary: "`DELETE` dùng cùng đường dẫn với get. Index tìm thấy thì bị xóa. `None` vẫn là 404.",
    blocks: [
      {
        text: "Chương trình đến đây có thể tạo, liệt kê, và lấy. Xóa là cùng đường dẫn với get, và method khác. `get(get_note).delete(delete_note)` trên `/notes/{id}` gửi `DELETE` tới một hàm mới. `GET` vẫn tới `get_note`. Axum chọn hàm từ method. Bạn không rẽ nhánh theo method bên trong một handler.",
      },
      {
        text: "`position` trả về `Option<usize>`, index của ghi chú đầu tiên có id đó, hoặc `None`. `None` là 404, cùng chính sách với get, và phần thân rỗng vì bạn trả về một `StatusCode` trần. Index tìm thấy thì `notes.remove(index)`. `remove` trả lại `Note`. Bạn bỏ nó. Response không cần nó. `StatusCode::NO_CONTENT` là 204. 204 không có phần thân. `Path<u64>` vẫn từ chối `/notes/salt` bằng 400 trước khi `delete_note` chạy.",
      },
      {
        caption:
          "Thay route chỉ có get từ bài 09. `delete` là `axum::routing::delete`. `State` và `Path` có thể đứng theo thứ tự nào cũng được. Cả hai đều không đọc phần thân.",
        outputLabel: "responses",
      },
      {
        text: "Bài 08 chọn id tiếp theo bằng `notes.len() as u64 + 1`. Cách đó đúng khi bạn chỉ push. Sau một lần xóa thì không. Hai ghi chú, id 1 và 2, xóa 2, `len` còn 1, nên lần tạo tiếp theo nhận lại id 2. Hai ghi chú cùng id, và get trả về ghi chú mà `find` thấy trước. Đổi dòng đó trong `create_note`, vẫn dưới cùng một guard với `push`.",
      },
      {
        caption:
          "Thay `id: notes.len() as u64 + 1` trong `create_note`. `max` trên iterator rỗng là `None`, và `unwrap_or(0)` làm id đầu tiên thành 1.",
      },
      {
        title: "Guard là mut",
        text: "`remove` đổi `Vec`, nên lock là `let mut notes`. Get và list vẫn là `let notes`. Bạn vẫn không `.await` khi guard còn sống. Guard rơi ở cuối hàm, sau `remove` và sau khi bạn đã dựng status.",
      },
      {
        prompt: "Cách xóa nào là 404 khi thiếu id? Cách kia panic.",
        why: "`position` là một `Option`. `None` nghĩa là id không có trong danh sách, và chương trình này trả lời bằng 404. `unwrap` trên `None` đó thì panic, và panic là 500. Cả hai đoạn đều biên dịch khi id có mặt. Chỉ một đoạn là chính sách cho id thiếu.",
      },
    ],
    quiz: [
      {
        prompt: "`DELETE /notes/1` khi ghi chú 1 tồn tại thì trả về gì?",
        choices: [
          "204 và phần thân rỗng.",
          "200 và ghi chú đã xóa dưới dạng JSON.",
          "201, vì danh sách đã đổi.",
          "404, vì ghi chú giờ đã mất.",
        ],
        why: "`StatusCode::NO_CONTENT` là 204. Ghi chú được tìm thấy và bị xóa. 404 chỉ là nhánh `None`, trước `remove`.",
      },
      {
        prompt: "Vì sao `delete_note` không trả về `Json<Note>`?",
        choices: [
          "Response không cần phần thân. `remove` đã lấy ghi chú ra khỏi danh sách.",
          "`Json` không trả về được từ handler `DELETE`.",
          "`Note` không implement `Clone`.",
          "Lock cấm di chuyển một `Note`.",
        ],
        why: "204 nghĩa là method đã chạy và không có gì để đọc lại. Bạn có thể trả về ghi chú, và chương trình này không làm vậy. `Note` bị bỏ từ `remove` là bản đã rời `Vec`.",
      },
      {
        prompt: "Sau một lần xóa, vì sao `len + 1` là id tiếp theo sai?",
        choices: [
          "`len` là số ghi chú còn lại, không phải id cao nhất từng được dùng.",
          "`len` không biên dịch trên `Vec<Note>`.",
          "Axum đặt lại mọi id về 0 sau `DELETE`.",
          "`Mutex` cấm đọc `len`.",
        ],
        why: "Xóa ghi chú cuối làm `len` nhỏ đi trong khi các id trước đó còn nguyên. Id tiếp theo phải hơn id lớn nhất còn lưu một đơn vị, và đó là thứ `max` đọc, dưới cùng lock với `push`.",
      },
    ],
  },
  "replace-one-note": {
    title: "Thay một ghi chú",
    summary: "`PUT` giữ id từ đường dẫn và ghi title cùng body mới. Phần thân sai vẫn là 400.",
    blocks: [
      {
        text: "`PUT /notes/{id}` thay title và body của một ghi chú. Id không đổi. Nó là `Path<u64>`, không phải field trong JSON. Phần thân là cùng `NewNote` như lúc tạo: `title` và `body`, cả hai là chuỗi. `POST /notes` vẫn tạo. `PUT` trên đường dẫn của cả danh sách không phải route trong chương trình này, nên Axum trả method đó bằng 405 và hàm của bạn không chạy.",
      },
      {
        text: "`Json` đứng cuối, như bài 04. `State` và `Path` không đọc phần thân, nên chúng có thể đứng trước. Phần thân sai là `JsonRejection`, được ánh xạ sang 400, và `?` chạy trước `lock`. Phần thân đúng mà id thiếu là 404. Bạn đã tìm ghi chú. Nó không có ở đó. `NewNote` đã parse bị bỏ cùng hàm. Bạn không chèn nó vào.",
      },
      {
        caption:
          "Nối `put` trên cùng route với get và delete. `put` là `axum::routing::put`. `JsonRejection` là cùng kiểu mà bài 06 đã ánh xạ.",
        outputLabel: "exchange",
      },
      {
        text: "`iter_mut` mượn ghi chú đang lưu. Hai phép gán chuyển các chuỗi mới vào ghi chú đó. `Vec` vẫn sở hữu nó. `Json` cần một `Note` được sở hữu sau khi guard rơi, nên `note.clone()` là bản rời đi. Field id không bao giờ bị gán. Một object JSON có thêm field `id` vẫn được nhận: serde bỏ qua field lạ, như bài 08, và id trên đường dẫn thắng.",
      },
      {
        title: "Put không tạo mới",
        text: "Nếu id thiếu, handler này trả 404. Nó không push. Tạo mới vẫn là `POST /notes`, nơi chọn id. Máy khách gửi `PUT` cho một id mới sẽ nhận 404, kể cả khi JSON đúng dạng.",
      },
      {
        prompt: "Chữ ký nào biên dịch được? `Json` đọc phần thân.",
        why: "`Json` tiêu thụ phần thân, nên nó là extractor cuối. `Path` sau `Json` là cùng lỗi như bài 04: phần thân đã bị lấy. Dạng `Result<Json<_>, JsonRejection>` trong bài cũng cùng thứ tự, với rejection được ánh xạ sang 400.",
      },
    ],
    quiz: [
      {
        prompt: "Id của ghi chú bị thay lấy từ đâu?",
        choices: [
          "Đoạn `{id}`, do `Path` parse.",
          "Một field tên `id` trong phần thân JSON.",
          "`notes.len()`, lần nữa.",
          "Bộ đếm của `Arc`.",
        ],
        why: "`NewNote` có `title` và `body`. `id` đang lưu là id mà `Path` đã parse. Các phép gán không đụng tới nó.",
      },
      {
        prompt: "`PUT /notes/9` với phần thân JSON hợp lệ, khi 9 chưa từng được lưu, trả về gì?",
        choices: [
          "404, và danh sách không đổi.",
          "201 và một ghi chú mới với id 9.",
          "204 và một danh sách rỗng.",
          "400, vì id không được dùng.",
        ],
        why: "Phần thân đã parse, nên đây không phải 400. `find` trả về `None`. Handler trả `NOT_FOUND` và không `push`.",
      },
      {
        prompt: "Vì sao `?` trên phần thân đứng trước `lock`?",
        choices: [
          "Phần thân sai nên thất bại mà không mượn danh sách.",
          "Mutex parse JSON.",
          "`Path` chỉ chạy sau một lock.",
          "200 không trả về được nếu bạn lock trước.",
        ],
        why: "Rejection là về phần thân của request. Danh sách chưa liên quan cho đến khi struct tồn tại. Đây là cùng thứ tự với `create_note`.",
      },
    ],
  },
  "filter-with-query": {
    title: "Lọc bằng query",
    summary: "`Query` đọc `?title=`, không đọc phần thân. Key thiếu là `None`, và danh sách vẫn nguyên.",
    blocks: [
      {
        text: "`GET /notes` trả về mọi ghi chú. Người gọi muốn một title thì thêm query string: `GET /notes?title=Salt`. Chuỗi đó không phải phần thân và không phải một đoạn đường dẫn. `axum::extract::Query` deserialize nó. `Query` implement `FromRequestParts`, nên nó không tiêu thụ phần thân. Nó có thể đứng cạnh `State` theo thứ tự nào cũng được. Handler này không có `Json`.",
      },
      {
        text: "Struct có một field tùy chọn. `#[derive(Deserialize)]` là cùng derive với `NewNote`. Key `title` thiếu là `None`, không phải lỗi, và bộ lọc giữ mọi ghi chú. `?title=Salt` là `Some`, và bộ lọc giữ các ghi chú có `title` bằng `String` đó. Key thừa bị bỏ qua, cùng mặc định serde như bài 08. Bạn không thêm `deny_unknown_fields`.",
      },
      {
        caption:
          "Đoạn này thay `list_notes` từ bài 08. Thêm `use axum::extract::Query`. `as_deref` biến `Option<String>` thành `Option<&str>`, nên phép so sánh chỉ mượn. Route vẫn là `get(list_notes).post(create_note)` trên `/notes`.",
        outputLabel: "responses",
      },
      {
        text: "Không khớp là 200 và `[]`, không phải 404. Bạn xin danh sách. Danh sách tồn tại và tình cờ không có ghi chú nào mang title đó. 404 vẫn là câu trả lời cho một id mà `find` không thấy. Nếu query string không deserialize được thành `ListQuery`, `Query` từ chối request bằng 400 và `list_notes` không chạy. Key thiếu không phải lỗi đó. `QueryRejection` là kiểu, cùng dạng sự kiện với `PathRejection`. Bài này không ánh xạ nó. 400 mặc định là 400 bạn muốn.",
      },
      {
        title: "Lock vẫn kết thúc",
        text: "`kept` là một `Vec` mới gồm các ghi chú đã clone. `Json` sở hữu vec đó. Guard có thể rơi ở cuối hàm. Bạn không trả về một lần mượn danh sách bên trong mutex.",
      },
      {
        prompt: "`GET /notes` không có dấu hỏi. `params.title` là gì?",
        why: "Key vắng mặt, nên serde điền `Option` bằng `None`, và bộ lọc giữ mọi ghi chú. `Some(\"\")` là giá trị của `?title=` không có gì sau dấu bằng, tức là key có mặt. Key vắng và giá trị rỗng không phải một.",
      },
    ],
    quiz: [
      {
        prompt: "`Query` đọc cái gì?",
        choices: [
          "Query string, như `?title=Salt`.",
          "Phần thân JSON.",
          "Đoạn đường dẫn `{id}`.",
          "`Arc` bên trong `AppState`.",
        ],
        why: "`Query` là extractor của các phần. Nó deserialize query trên URI. `Json` mới đọc phần thân. `Path` là đoạn đường dẫn.",
      },
      {
        prompt: "`GET /notes?title=Pepper` khi không ghi chú nào tên Pepper thì trả về gì?",
        choices: [
          "200 và `[]`.",
          "404 và phần thân rỗng.",
          "400, vì title chưa biết.",
          "204, vì bộ lọc đã xóa chúng.",
        ],
        why: "Request danh sách đã thành công. Không gì khớp. Rỗng là một `Vec` hợp lệ, cùng câu trả lời với danh sách rỗng ở bài 08. 404 là cho một id thiếu.",
      },
      {
        prompt: "Vì sao `Query` có thể đứng trước hoặc sau `State`?",
        choices: [
          "Không extractor nào trong hai cái đọc phần thân.",
          "`Query` tiêu thụ phần thân, nhưng `State` trả lại.",
          "Serde bắt `Query` phải đứng đầu.",
          "Mutex parse query string.",
        ],
        why: "Cả hai đều là extractor của các phần. Thứ tự giữa chúng không phải quy tắc phần thân. Quy tắc phần thân vẫn đặt `Json` cuối, và handler này không có `Json`.",
      },
    ],
  },
};
