import { createRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { useUi } from "@/content/localize";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  const ui = useUi();
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-4xl text-ink">{ui.notOnPath}</h1>
      <p className="mt-4 text-ink-soft">{ui.notOnPathBody}</p>
      <Link to="/" className="mt-8 inline-flex min-h-11 items-center text-oxide">
        {ui.backHome}
      </Link>
    </main>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
  });
}
