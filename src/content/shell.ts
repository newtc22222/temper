import type { Locale } from "@/lib/prefs";
import type { TrackId } from "./types";

export type TrackCopy = { title: string; summary: string };

const tracksEn: Record<TrackId, TrackCopy> = {
  request: {
    title: "The request",
    summary: "What the framework owns, and the first function it calls.",
  },
  body: {
    title: "The body",
    summary: "Bytes become a struct you own, and a struct becomes bytes.",
  },
  list: {
    title: "The list",
    summary: "One `Vec`, shared. Create, list, and get one note.",
  },
  program: {
    title: "The program",
    summary: "Read the compiler, split the files, walk one request.",
  },
};

const tracksVi: Record<TrackId, TrackCopy> = {
  request: {
    title: "Yêu cầu",
    summary: "Framework sở hữu gì, và hàm đầu tiên nó gọi.",
  },
  body: {
    title: "Phần thân",
    summary: "Byte thành một struct bạn sở hữu, và struct thành byte.",
  },
  list: {
    title: "Danh sách",
    summary: "Một `Vec`, dùng chung. Tạo, liệt kê, và lấy một ghi chú.",
  },
  program: {
    title: "Chương trình",
    summary: "Đọc compiler, tách file, đi theo một request.",
  },
};

export const trackCopy: Record<Locale, Record<TrackId, TrackCopy>> = {
  en: tracksEn,
  vi: tracksVi,
};

export const glossaryVi: { body: string }[] = [
  {
    body: "Crate sở hữu socket và gọi các hàm của bạn. Trong khóa này crate đó là Axum, và chỉ có nó.",
  },
  {
    body: "Một `async fn` mà Axum gọi khi một route khớp. Đối số của nó là các extractor. Giá trị trả về thành response. Bạn không tự implement trait `Handler`.",
  },
  {
    body: "Bảng các route. `Router::new()` bắt đầu nó. `.route` thêm một đường dẫn. `.with_state` cất giá trị các handler dùng chung. Sau `.with_state`, `axum::serve` có thể chạy nó.",
  },
  {
    body: "Một method, một đường dẫn, và một handler. `POST /notes` và `GET /notes` dùng chung một chuỗi đường dẫn và khác nhau ở method: `get(list_notes).post(create_note)`.",
  },
  {
    body: "Một kiểu biến một phần của request thành đối số. `Path`, `Json`, và `State` là những extractor khóa này dùng. Extractor không đọc phần thân có thể đứng ở thứ tự bất kỳ. `Json` đọc phần thân, nên nó đứng cuối.",
  },
  {
    body: "Extractor cho các đoạn `{id}` trong Axum 0.8. Một `Path<u64>` đơn parse đoạn đó thành số nguyên bạn sở hữu. Đoạn không vừa là 400, và handler không chạy.",
  },
  {
    body: "Vừa là extractor vừa là response. Là extractor, nó tiêu thụ phần thân và giải tuần tự thành một giá trị bạn sở hữu. Là response, `Json(value)` tuần tự hóa và đặt `content-type: application/json`.",
  },
  {
    body: "Trait serde mà `Json` và một `Path` dạng struct yêu cầu trên đường vào. `#[derive(Deserialize)]` là đủ cho một struct gồm các field bạn đã hiểu. Dependency serde cần feature `derive`.",
  },
  {
    body: "Trait serde một kiểu cần có trước khi trả về dưới dạng `Json<T>`. `#[derive(Serialize)]` trên `Note` là thứ làm danh sách và một ghi chú đơn ghi ra được.",
  },
  {
    body: "Dữ liệu dùng chung, được clone vào mỗi lần gọi handler. `.with_state` đòi `Clone`. `State<AppState>` rẻ vì clone struct là clone một `Arc`, không phải `Vec`.",
  },
  {
    body: "Sở hữu dùng chung. Clone nó tăng một bộ đếm. Nó không clone `Vec` bên trong mutex. Đó là bản clone mà `State` thực hiện.",
  },
  {
    body: "Một guard một lúc. `lock` mượn danh sách cho đến khi guard rơi. Khóa này dùng `std::sync::Mutex` và không `.await` khi guard còn sống.",
  },
  {
    body: "Phía `Err` của một extractor. `JsonRejection` là cách một phần thân sai thất bại. `PathRejection` là cách một đoạn sai thất bại. Cả hai là `Result`, không phải panic.",
  },
  {
    body: "Bound trên kiểu trả về của handler. Mã trạng thái, chuỗi, `Json<T>`, tuple của những thứ đó, và `Result` của chúng đều implement nó. Một `Note` trần thì không.",
  },
  {
    body: "Một yêu cầu viết `Type: Trait`. Đọc là “kiểu này phải implement trait đó.” Khi một handler không biên dịch, hãy xử lý bound bên trong. Dòng `Handler` bên ngoài chỉ là lớp bọc.",
  },
  {
    body: "Tokio, đã được `#[tokio::main]` khởi động và được `axum::serve` dùng. Khóa này không cấu hình nó, không spawn task, và không nhắc `Pin` nữa.",
  },
];

export const signatureVi: { title: string; note: string }[] = [
  { title: "Văn bản", note: "200, `text/plain; charset=utf-8`." },
  {
    title: "Một đoạn đường dẫn",
    note: "Ngoặc nhọn của Axum 0.8. Đoạn sai là 400 trước khi hàm chạy.",
  },
  {
    title: "JSON vào, cuối cùng",
    note: "`Json` tiêu thụ phần thân. `State` đứng trước.",
  },
  {
    title: "Phần thân sai thành 400",
    note: "Mọi `JsonRejection` ánh xạ về một mã. Không có enum lỗi.",
  },
  {
    title: "Thiếu ghi chú thành 404",
    note: "`None` là id không có. Thân của một status trần là rỗng.",
  },
  {
    title: "State",
    note: "Bản clone mà `State` tạo là `Arc`. Bản clone `Vec` là bản bạn viết.",
  },
  {
    title: "Router và serve",
    note: "`.with_state` trước. `unwrap` ở đây là lúc khởi động tiến trình, không phải một request.",
  },
];

export const statusVi: { when: string; who: string }[] = [
  {
    when: "`GET /notes`, kể cả `[]`. Một `&'static str` được trả về. `Json<T>` không kèm status bên cạnh.",
    who: "Bạn trả về một giá trị. Axum ghi 200.",
  },
  {
    when: "`POST /notes` đã lưu một ghi chú. Phần thân là ghi chú đó dưới dạng JSON.",
    who: "Bạn trả về `StatusCode::CREATED` cùng `Json(note)`.",
  },
  {
    when: "Đoạn `{id}` không phải `u64`, hoặc handler ánh xạ `JsonRejection` sang `BAD_REQUEST`.",
    who: "`Path`, theo mặc định. Hoặc `map_err` của bạn.",
  },
  {
    when: "Đoạn đã parse, và không ghi chú nào có id đó. Phần thân rỗng.",
    who: "Bạn biến `None` thành `StatusCode::NOT_FOUND`.",
  },
  {
    when: "Bạn để `Json<T>` không bọc, và content type không phải JSON. Khóa này ánh xạ trường hợp đó sang 400.",
    who: "`JsonRejection` của Axum, chỉ khi bạn không bắt nó.",
  },
  {
    when: "Bạn để `Json<T>` không bọc, và JSON không khớp struct. Khóa này ánh xạ trường hợp đó sang 400.",
    who: "`JsonRejection` của Axum, chỉ khi bạn không bắt nó.",
  },
  {
    when: "Một panic, kể cả `unwrap` trên một rejection hoặc trên `None`. Không phải status chương trình này chủ ý trả.",
    who: "Runtime, sau một panic. Đừng dùng nó như một chính sách.",
  },
];
