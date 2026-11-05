import type { Locale } from "@/lib/prefs";

export type UiCopy = {
  siteName: string;
  kicker: string;
  ledeBefore: string;
  languageCourse: string;
  ledeAfter: string;
  know: string;
  rulesTitle: string;
  rules: readonly string[];
  path: string;
  glossary: string;
  pocket: string;
  skip: string;
  jump: string;
  doneWord: string;
  fragment: string;
  fails: string;
  copy: string;
  copied: string;
  output: string;
  rustc: string;
  quiz: string;
  notQuite: string;
  lessonDone: string;
  lessonUndone: string;
  next: string;
  previous: string;
  start: string;
  pathLead: string;
  clear: string;
  clearConfirm: string;
  glossaryLead: string;
  pocketLead: string;
  signatures: string;
  statuses: string;
  who: string;
  notOnPath: string;
  notOnPathBody: string;
  missingLesson: string;
  backHome: string;
  footer: string;
  minutes: string;
  about: string;
  trackLabel: string;
  themeLight: string;
  themeDark: string;
  themeLabel: string;
  langLabel: string;
};

const en: UiCopy = {
  siteName: "Temper",
  kicker: "A short Axum course",
  ledeBefore: "This course starts after ",
  languageCourse: "the language course",
  ledeAfter: " and does not replace it.",
  know: "You should already be able to read ownership, `&` and `&mut`, `Option`, `Result`, structs, enums, iterators, modules, and `Debug`, `Clone`, and `Display`.",
  rulesTitle: "Three rules",
  rules: [
    "Axum is the only HTTP framework here. Nothing in this course asks you to compare it with another.",
    "This site does not run your code. There is no compiler in the browser. Read the signatures, then type them yourself.",
    "The program is an in-memory list of notes: create, list, get one, replace, delete, and change one field. A query can narrow the list. An unknown path is 404. No database and no accounts.",
  ],
  path: "Path",
  glossary: "Glossary",
  pocket: "Pocket",
  skip: "Skip to content",
  jump: "Jump to a lesson",
  doneWord: "Done",
  fragment: "Fragment",
  fails: "Does not compile",
  copy: "Copy",
  copied: "Copied",
  output: "Output",
  rustc: "rustc",
  quiz: "Check",
  notQuite: "Not this one.",
  lessonDone: "Lesson marked done in this browser.",
  lessonUndone: "This lesson is done only when each answer is right.",
  next: "Next",
  previous: "Previous",
  start: "Begin at 01",
  pathLead: "Seventeen lessons. One program. The count is how many checks you have finished here.",
  clear: "Clear progress",
  clearConfirm: "Clear progress from this browser",
  glossaryLead: "Terms this course uses. The language course’s terms are assumed, not repeated.",
  pocketLead:
    "Signatures match Axum 0.8. Status codes are the ones this program actually returns, plus the defaults Axum uses if you leave `Json` unwrapped.",
  signatures: "Signatures",
  statuses: "Status codes",
  who: "Who decides",
  notOnPath: "Not on the path",
  notOnPathBody: "That page is not part of this course.",
  missingLesson: "This lesson is not on the path.",
  backHome: "Back home",
  footer: "Temper does not compile or run the samples. Progress stays in this browser.",
  minutes: "min",
  about: "minutes",
  trackLabel: "Track",
  themeLight: "Light",
  themeDark: "Dark",
  themeLabel: "Theme",
  langLabel: "Language",
};

const vi: UiCopy = {
  siteName: "Temper",
  kicker: "Một khóa Axum ngắn",
  ledeBefore: "Khóa này bắt đầu sau ",
  languageCourse: "khóa ngôn ngữ",
  ledeAfter: " và không thay thế nó.",
  know: "Bạn nên đọc được ownership, `&` và `&mut`, `Option`, `Result`, struct, enum, iterator, module, và `Debug`, `Clone`, `Display`.",
  rulesTitle: "Ba quy tắc",
  rules: [
    "Axum là framework HTTP duy nhất ở đây. Không phần nào của khóa này bảo bạn so sánh nó với framework khác.",
    "Trang này không chạy code của bạn. Không có compiler trong trình duyệt. Đọc chữ ký, rồi tự gõ.",
    "Chương trình là một danh sách ghi chú trong bộ nhớ: tạo, liệt kê, lấy một cái, thay, xóa, và đổi một field. Một truy vấn (query) có thể thu hẹp danh sách. Đường dẫn không có là 404. Không cơ sở dữ liệu (database), không tài khoản.",
  ],
  path: "Lộ trình",
  glossary: "Thuật ngữ",
  pocket: "Túi",
  skip: "Tới nội dung",
  jump: "Nhảy tới một bài",
  doneWord: "Xong",
  fragment: "Đoạn",
  fails: "Không biên dịch",
  copy: "Sao chép",
  copied: "Đã chép",
  output: "Đầu ra",
  rustc: "rustc",
  quiz: "Kiểm tra",
  notQuite: "Không phải đáp án này.",
  lessonDone: "Bài này đã được đánh dấu xong trên trình duyệt này.",
  lessonUndone: "Bài chỉ xong khi mỗi câu trả lời đều đúng.",
  next: "Tiếp",
  previous: "Trước",
  start: "Bắt đầu từ 01",
  pathLead: "Mười bảy bài. Một chương trình. Số đếm là số bài kiểm tra bạn đã xong ở đây.",
  clear: "Xóa tiến độ",
  clearConfirm: "Xóa tiến độ khỏi trình duyệt này",
  glossaryLead: "Thuật ngữ khóa này dùng. Thuật ngữ của khóa ngôn ngữ được giả định, không nhắc lại.",
  pocketLead:
    "Chữ ký khớp Axum 0.8. Mã trạng thái là những mã chương trình này thực sự trả, cộng với mặc định Axum dùng nếu bạn để `Json` không bọc.",
  signatures: "Chữ ký",
  statuses: "Mã trạng thái",
  who: "Ai quyết định",
  notOnPath: "Không nằm trên lộ trình",
  notOnPathBody: "Trang đó không thuộc khóa này.",
  missingLesson: "Bài này không nằm trên lộ trình.",
  backHome: "Về trang chủ",
  footer: "Temper không biên dịch hay chạy mẫu. Tiến độ ở lại trên trình duyệt này.",
  minutes: "phút",
  about: "phút",
  trackLabel: "Phần",
  themeLight: "Sáng",
  themeDark: "Tối",
  themeLabel: "Giao diện",
  langLabel: "Ngôn ngữ",
};

export const copy: Record<Locale, UiCopy> = { en, vi };
