import { homeIcon, sunIcon, moonIcon, backIcon } from "../assets/icons";
import { navigate, getCurrentRoute } from "../router";

let isDark = true;

export function renderHeader(container: HTMLElement): void {
  const header = document.createElement("header");
  header.id = "app-header";
  header.innerHTML = `
    <button id="nav-btn" class="header-btn" aria-label="Home">
      ${homeIcon()}
    </button>
    <h1 id="page-title">sato_hub</h1>
    <button id="theme-toggle" class="header-btn" aria-label="Toggle theme">
      ${sunIcon()}
    </button>
  `;
  container.prepend(header);

  // Restore theme from localStorage
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    isDark = false;
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    updateThemeIcon();
  }

  document.getElementById("nav-btn")!.addEventListener("click", handleNavClick);
  document.getElementById("theme-toggle")!.addEventListener("click", toggleTheme);
}

function handleNavClick(): void {
  const route = getCurrentRoute();
  if (route.view === "play") {
    navigate(`/project/${route.slug}`);
  } else if (route.view === "detail") {
    navigate("/");
  } else {
    navigate("/");
  }
}

export function updateHeaderForRoute(view: string, title?: string): void {
  const pageTitle = document.getElementById("page-title");
  const navBtn = document.getElementById("nav-btn");
  if (!pageTitle || !navBtn) return;

  if (view === "play" && title) {
    pageTitle.textContent = title;
    navBtn.innerHTML = backIcon();
    navBtn.setAttribute("aria-label", "Back to details");
  } else if (view === "detail") {
    pageTitle.textContent = "sato_hub";
    navBtn.innerHTML = backIcon();
    navBtn.setAttribute("aria-label", "Back to grid");
  } else {
    pageTitle.textContent = "sato_hub";
    navBtn.innerHTML = homeIcon();
    navBtn.setAttribute("aria-label", "Home");
  }
}

function toggleTheme(): void {
  isDark = !isDark;
  document.body.classList.toggle("dark", isDark);
  document.body.classList.toggle("light", !isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
}

function updateThemeIcon(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.innerHTML = isDark ? sunIcon() : moonIcon();
}
