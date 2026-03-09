import "./style.css";
import { renderHeader, updateHeaderForRoute } from "./components/header";
import { renderGrid } from "./views/grid";
import { renderDetail } from "./views/detail";
import { renderPlay } from "./views/play";
import { initRouter, type Route } from "./router";
import { getProjectBySlug } from "./data/projects";

// Mount app
const app = document.getElementById("app")!;

// Create persistent header + main container
const main = document.createElement("main");
main.id = "app-main";
app.appendChild(main);
renderHeader(app);

// Route handler
function onRoute(route: Route): void {
  // Scroll back to top on navigation
  window.scrollTo(0, 0);

  switch (route.view) {
    case "grid":
      updateHeaderForRoute("grid");
      main.innerHTML = "";
      renderGrid(main);
      break;
    case "detail": {
      const project = getProjectBySlug(route.slug);
      updateHeaderForRoute("detail", project?.name);
      main.innerHTML = "";
      renderDetail(main, route.slug);
      break;
    }
    case "play": {
      const project = getProjectBySlug(route.slug);
      updateHeaderForRoute("play", project?.name);
      main.innerHTML = "";
      renderPlay(main, route.slug);
      break;
    }
  }
}

initRouter(onRoute);
