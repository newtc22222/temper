import type { DiagramId } from "./types";
import type { Locale } from "@/lib/prefs";

type Step = { k: string; v: string; point?: boolean };

type DiagramStrings = {
  owns: {
    caption: string;
    whoFramework: string;
    socket: string;
    owns: string;
    request: string;
    you: string;
    handler: string;
    returns: string;
  };
  signature: { caption: string; steps: Step[] };
  path: {
    caption: string;
    route: string;
    detail: string;
    mover: string;
    who: string;
    name: string;
    owned: string;
  };
  body: {
    caption: string;
    who: string;
    detail: string;
    mover: string;
    you: string;
    name: string;
    yours: string;
  };
  jsonout: {
    caption: string;
    you: string;
    name: string;
    detail: string;
    mover: string;
    type: string;
    status: string;
  };
  status: { caption: string; steps: Step[] };
  lock: {
    caption: string;
    who: string;
    name: string;
    detail: string;
    mover: string;
    request: string;
    clone: string;
    json: string;
  };
  shelf: { caption: string; steps: Step[] };
  option: { caption: string; steps: Step[] };
  bound: { caption: string; steps: Step[] };
  modules: { caption: string; steps: Step[] };
  walk: { caption: string; steps: Step[] };
};

const en: DiagramStrings = {
  owns: {
    caption: "The socket stays with the framework. The value you return is yours.",
    whoFramework: "Framework",
    socket: "socket",
    owns: "owns the connection",
    request: "request",
    you: "You",
    handler: "handler",
    returns: 'returns "notes"',
  },
  signature: {
    caption: "Read the signature as four pieces: async fn, an extractor, and the value you return.",
    steps: [
      { k: "async fn", v: "a function the runtime can call" },
      { k: "State", v: "a cheap clone of shared data" },
      { k: "Path", v: "one segment, already parsed" },
      { k: "→ str", v: "the value you return", point: true },
    ],
  },
  path: {
    caption: "The segment becomes a u64 you own. You do not slice the URL.",
    route: "Route",
    detail: "{id} in the path string",
    mover: "4",
    who: "Path<u64>",
    name: "id = 4",
    owned: "owned integer, or 400",
  },
  body: {
    caption: "The bytes are consumed. The struct is yours. A bad body is a Result, not a panic.",
    who: "Body",
    detail: "buffer dropped after parse",
    mover: "Deserialize",
    you: "You",
    name: "NewNote",
    yours: "title and body are Strings",
  },
  jsonout: {
    caption: "Serialize is the way back. Json sets the content type and takes the note by value.",
    you: "You",
    name: "Note",
    detail: "id, title, body",
    mover: "Json",
    type: "application/json",
    status: "status 200 unless you add one",
  },
  status: {
    caption: "A created note is 201. A bad body is 400. None is 404. No error tower.",
    steps: [
      { k: "201", v: "the note was stored", point: true },
      { k: "400", v: "the body could not be read", point: true },
      { k: "404", v: "the id parsed, and the note is missing", point: true },
    ],
  },
  lock: {
    caption: "The request borrows the list. The state keeps it. The guard drops before you await.",
    who: "AppState",
    name: "Arc · Mutex · Vec",
    detail: "the list lives here",
    mover: "guard",
    request: "This request",
    clone: "clone of the Vec",
    json: "Json owns the copy",
  },
  shelf: {
    caption: "POST pushes one note. GET clones the list out. An empty list is still 200.",
    steps: [
      { k: "POST", v: "parse, then lock, then push" },
      { k: "Vec", v: "Salt is stored under id 1", point: true },
      { k: "GET", v: "a clone leaves the lock as JSON" },
    ],
  },
  option: {
    caption: "Some becomes 200 and the note. None becomes 404. A segment that is not a number never arrives.",
    steps: [
      { k: "find 1", v: "Some(note) → 200", point: true },
      { k: "find 9", v: "None → 404", point: true },
      { k: "/salt", v: "Path rejects it → 400" },
    ],
  },
  bound: {
    caption: "The outer Handler line is the wrapper. Read the inner bound. That is the fix.",
    steps: [
      { k: "Handler", v: "wrapper — your function was passed to get" },
      { k: "Clone", v: "AppState: Clone — this is the line to change", point: true },
    ],
  },
  modules: {
    caption: "main starts the runtime. routes owns the handlers. notes owns the Vec.",
    steps: [
      { k: "main.rs", v: "bind, then axum::serve" },
      { k: "routes.rs", v: "the handlers and the router", point: true },
      { k: "notes.rs", v: "Note, NewNote, AppState", point: true },
    ],
  },
  walk: {
    caption: "Socket, route, State clone, Json body, your Result, then the bytes.",
    steps: [
      { k: "1", v: "socket, owned by Axum" },
      { k: "2", v: "POST /notes matches create_note" },
      { k: "3", v: "State clones the Arc" },
      { k: "4", v: "Json owns a NewNote, or 400" },
      { k: "5", v: "lock, push, return 201", point: true },
      { k: "6", v: "Axum writes the bytes" },
    ],
  },
};

const vi: DiagramStrings = {
  owns: {
    caption: "Socket ở lại với framework. Giá trị bạn trả về là của bạn.",
    whoFramework: "Framework",
    socket: "socket",
    owns: "sở hữu kết nối",
    request: "request",
    you: "Bạn",
    handler: "handler",
    returns: 'trả về "notes"',
  },
  signature: {
    caption: "Đọc chữ ký thành bốn phần: async fn, một extractor, và giá trị bạn trả về.",
    steps: [
      { k: "async fn", v: "một hàm runtime có thể gọi" },
      { k: "State", v: "bản clone rẻ của dữ liệu dùng chung" },
      { k: "Path", v: "một đoạn, đã được parse" },
      { k: "→ str", v: "giá trị bạn trả về", point: true },
    ],
  },
  path: {
    caption: "Đoạn đường dẫn thành một u64 bạn sở hữu. Bạn không cắt URL.",
    route: "Route",
    detail: "{id} trong chuỗi đường dẫn",
    mover: "4",
    who: "Path<u64>",
    name: "id = 4",
    owned: "số nguyên bạn sở hữu, hoặc 400",
  },
  body: {
    caption: "Byte bị tiêu thụ. Struct là của bạn. Phần thân sai là một Result, không phải panic.",
    who: "Body",
    detail: "buffer bị bỏ sau khi parse",
    mover: "Deserialize",
    you: "Bạn",
    name: "NewNote",
    yours: "title và body là String",
  },
  jsonout: {
    caption: "Serialize là đường về. Json đặt content type và nhận note theo giá trị.",
    you: "Bạn",
    name: "Note",
    detail: "id, title, body",
    mover: "Json",
    type: "application/json",
    status: "status 200 trừ khi bạn thêm một mã",
  },
  status: {
    caption: "Ghi chú vừa tạo là 201. Phần thân sai là 400. None là 404. Không có tháp lỗi.",
    steps: [
      { k: "201", v: "ghi chú đã được lưu", point: true },
      { k: "400", v: "không đọc được phần thân", point: true },
      { k: "404", v: "id đã parse, và không có ghi chú", point: true },
    ],
  },
  lock: {
    caption: "Request mượn danh sách. State giữ nó. Guard rơi trước khi bạn await.",
    who: "AppState",
    name: "Arc · Mutex · Vec",
    detail: "danh sách sống ở đây",
    mover: "guard",
    request: "Request này",
    clone: "bản clone của Vec",
    json: "Json sở hữu bản sao",
  },
  shelf: {
    caption: "POST đẩy một ghi chú. GET clone danh sách ra. Danh sách rỗng vẫn là 200.",
    steps: [
      { k: "POST", v: "parse, rồi lock, rồi push" },
      { k: "Vec", v: "Salt được lưu dưới id 1", point: true },
      { k: "GET", v: "một bản clone rời lock dưới dạng JSON" },
    ],
  },
  option: {
    caption: "Some thành 200 và ghi chú. None thành 404. Đoạn không phải số thì không bao giờ tới hàm.",
    steps: [
      { k: "find 1", v: "Some(note) → 200", point: true },
      { k: "find 9", v: "None → 404", point: true },
      { k: "/salt", v: "Path từ chối → 400" },
    ],
  },
  bound: {
    caption: "Dòng Handler bên ngoài là lớp bọc. Đọc bound bên trong. Đó là chỗ cần sửa.",
    steps: [
      { k: "Handler", v: "lớp bọc — hàm của bạn được truyền vào get" },
      { k: "Clone", v: "AppState: Clone — đây là dòng cần đổi", point: true },
    ],
  },
  modules: {
    caption: "main khởi động runtime. routes sở hữu các handler. notes sở hữu Vec.",
    steps: [
      { k: "main.rs", v: "bind, rồi axum::serve" },
      { k: "routes.rs", v: "các handler và router", point: true },
      { k: "notes.rs", v: "Note, NewNote, AppState", point: true },
    ],
  },
  walk: {
    caption: "Socket, route, clone State, phần thân Json, Result của bạn, rồi đến byte.",
    steps: [
      { k: "1", v: "socket, Axum sở hữu" },
      { k: "2", v: "POST /notes khớp create_note" },
      { k: "3", v: "State clone Arc" },
      { k: "4", v: "Json sở hữu một NewNote, hoặc 400" },
      { k: "5", v: "lock, push, trả 201", point: true },
      { k: "6", v: "Axum viết các byte" },
    ],
  },
};

export const diagramCopy: Record<Locale, DiagramStrings> = { en, vi };

export type DiagramCopy = DiagramStrings[DiagramId];
