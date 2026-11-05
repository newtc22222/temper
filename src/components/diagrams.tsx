import type { ReactNode } from "react";
import type { DiagramId } from "@/content/types";
import { diagramCopy } from "@/content/diagram-copy";
import { usePrefs } from "@/lib/prefs";

function Frame({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="diagram">
      <div className="diagram-stage" aria-hidden="true">
        {children}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function Node({
  who,
  name,
  detail,
  you,
}: {
  who: string;
  name: string;
  detail: string;
  you?: boolean;
}) {
  return (
    <div className={you ? "d-node d-you" : "d-node"}>
      <span className="d-who">{who}</span>
      <b>{name}</b>
      <span className="d-detail">{detail}</span>
    </div>
  );
}

function Steps({ items }: { items: { k: string; v: string; point?: boolean }[] }) {
  return (
    <ol className="d-steps">
      {items.map((step) => (
        <li key={step.k} className={step.point ? "is-point" : undefined}>
          <span className="d-k">{step.k}</span>
          <span className="d-v">{step.v}</span>
        </li>
      ))}
    </ol>
  );
}

function Owns() {
  const d = diagramCopy[usePrefs().locale].owns;
  return (
    <Frame caption={d.caption}>
      <div className="d-col">
        <Node who={d.whoFramework} name={d.socket} detail={d.owns} />
        <div className="d-track">
          <span className="mover">{d.request}</span>
        </div>
        <Node who={d.you} name={d.handler} detail={d.returns} you />
      </div>
    </Frame>
  );
}

function Signature() {
  const d = diagramCopy[usePrefs().locale].signature;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

function PathDiagram() {
  const d = diagramCopy[usePrefs().locale].path;
  return (
    <Frame caption={d.caption}>
      <div className="d-col">
        <div className="d-node">
          <span className="d-who">{d.route}</span>
          <b>
            /notes/<span className="text-oxide">4</span>
          </b>
          <span className="d-detail">{d.detail}</span>
        </div>
        <div className="d-track">
          <span className="mover">{d.mover}</span>
        </div>
        <Node who={d.who} name={d.name} detail={d.owned} you />
      </div>
    </Frame>
  );
}

function BodyDiagram() {
  const d = diagramCopy[usePrefs().locale].body;
  return (
    <Frame caption={d.caption}>
      <div className="d-col">
        <div className="d-node">
          <span className="d-who">{d.who}</span>
          <b className="d-struck">{`{"title":"Salt"}`}</b>
          <span className="d-detail">{d.detail}</span>
        </div>
        <div className="d-track">
          <span className="mover">{d.mover}</span>
        </div>
        <Node who={d.you} name={d.name} detail={d.yours} you />
      </div>
    </Frame>
  );
}

function JsonOut() {
  const d = diagramCopy[usePrefs().locale].jsonout;
  return (
    <Frame caption={d.caption}>
      <div className="d-col">
        <Node who={d.you} name={d.name} detail={d.detail} you />
        <div className="d-track">
          <span className="mover">{d.mover}</span>
        </div>
        <div className="d-node">
          <span className="d-who">{d.type}</span>
          <b>{`{"id":1,"title":"Salt"}`}</b>
          <span className="d-detail">{d.status}</span>
        </div>
      </div>
    </Frame>
  );
}

function StatusDiagram() {
  const d = diagramCopy[usePrefs().locale].status;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

function LockDiagram() {
  const d = diagramCopy[usePrefs().locale].lock;
  return (
    <Frame caption={d.caption}>
      <div className="d-col">
        <div className="d-node">
          <span className="d-who">{d.who}</span>
          <b>{d.name}</b>
          <span className="d-detail">{d.detail}</span>
        </div>
        <div className="d-track d-lock">
          <span className="shackle" />
          <span className="mover">{d.mover}</span>
        </div>
        <Node who={d.request} name={d.clone} detail={d.json} you />
      </div>
    </Frame>
  );
}

function Shelf() {
  const d = diagramCopy[usePrefs().locale].shelf;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

function OptionDiagram() {
  const d = diagramCopy[usePrefs().locale].option;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

function Bound() {
  const d = diagramCopy[usePrefs().locale].bound;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

function Modules() {
  const d = diagramCopy[usePrefs().locale].modules;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

function Walk() {
  const d = diagramCopy[usePrefs().locale].walk;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

function QueryDiagram() {
  const d = diagramCopy[usePrefs().locale].query;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

function MissDiagram() {
  const d = diagramCopy[usePrefs().locale].miss;
  return (
    <Frame caption={d.caption}>
      <Steps items={d.steps} />
    </Frame>
  );
}

const diagrams: Record<DiagramId, () => ReactNode> = {
  owns: Owns,
  signature: Signature,
  path: PathDiagram,
  body: BodyDiagram,
  jsonout: JsonOut,
  status: StatusDiagram,
  lock: LockDiagram,
  shelf: Shelf,
  option: OptionDiagram,
  bound: Bound,
  modules: Modules,
  walk: Walk,
  query: QueryDiagram,
  miss: MissDiagram,
};

export function Diagram({ id }: { id: DiagramId }) {
  const View = diagrams[id];
  return <View />;
}
