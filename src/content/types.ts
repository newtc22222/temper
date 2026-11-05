export type TrackId = "request" | "body" | "list" | "program" | "change" | "edge";

export type DiagramId =
  | "owns"
  | "signature"
  | "path"
  | "body"
  | "jsonout"
  | "status"
  | "lock"
  | "shelf"
  | "option"
  | "bound"
  | "modules"
  | "walk"
  | "query"
  | "miss";

export type SnipLabel = "fragment" | "fails";

export type Block =
  | { type: "prose"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; tone: "note" | "warn"; title: string; text: string }
  | {
      type: "code";
      file?: string;
      label?: SnipLabel;
      lang?: "rust" | "plain";
      caption?: string;
      code: string;
      output?: string;
      outputLabel?: string;
    }
  | {
      type: "pick";
      prompt: string;
      a: { code: string; label?: SnipLabel };
      b: { code: string; label?: SnipLabel };
      answer: "a" | "b";
      why: string;
    }
  | { type: "links"; items: { label: string; href: string; note: string }[] };

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: { id: string; text: string }[];
  answer: string;
  why: string;
};

export type Lesson = {
  slug: string;
  number: number;
  track: TrackId;
  minutes: number;
  title: string;
  summary: string;
  diagram: DiagramId;
  blocks: Block[];
  quiz: [QuizQuestion, QuizQuestion, QuizQuestion];
};

export type Track = {
  id: TrackId;
  title: string;
  summary: string;
};
