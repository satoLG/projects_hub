export type Route =
  | { view: "grid" }
  | { view: "detail"; slug: string }
  | { view: "play"; slug: string };

export type RouteHandler = (route: Route) => void;

let handler: RouteHandler | null = null;

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, "");
  if (h.startsWith("project/")) {
    const rest = h.slice("project/".length);
    if (rest.endsWith("/play")) {
      return { view: "play", slug: rest.replace(/\/play$/, "") };
    }
    return { view: "detail", slug: rest };
  }
  return { view: "grid" };
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function initRouter(onRoute: RouteHandler): void {
  handler = onRoute;

  const dispatch = () => {
    const route = parseHash(window.location.hash);
    handler?.(route);
  };

  window.addEventListener("hashchange", dispatch);
  dispatch();
}

export function getCurrentRoute(): Route {
  return parseHash(window.location.hash);
}
