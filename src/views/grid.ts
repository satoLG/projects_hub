import { projects } from "../data/projects";
import { navigate } from "../router";
import { applyTiltEffect } from "../effects/tilt";

export function renderGrid(container: HTMLElement): void {
  container.innerHTML = `
    <div class="search-wrapper">
      <input type="text" id="search-input" placeholder="Search projects..." autocomplete="off" />
    </div>
    <div id="grid" class="project-grid"></div>
  `;

  const grid = document.getElementById("grid")!;
  const searchInput = document.getElementById("search-input") as HTMLInputElement;

  projects.forEach((project, i) => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.dataset.slug = project.slug;
    card.style.animationDelay = `${i * 0.07}s`;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-image-wrapper">
          <img
            src="${project.boxartPath}"
            alt="${project.name}"
            decoding="async"
            onerror="this.onerror=null;this.src='${project.iconPath}'"
          />
        </div>
        <div class="card-label">
          <span>${project.name}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      navigate(`/project/${project.slug}`);
    });

    grid.appendChild(card);
  });

  // Apply 3D tilt after cards are in the DOM
  requestAnimationFrame(() => {
    const cards = grid.querySelectorAll<HTMLElement>(".project-card");
    cards.forEach((card) => applyTiltEffect(card));
  });

  // Search filtering
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    const cards = grid.querySelectorAll<HTMLElement>(".project-card");
    cards.forEach((card) => {
      const label = card.querySelector(".card-label span")?.textContent?.toLowerCase() ?? "";
      const match = !query || label.includes(query);
      card.style.display = match ? "" : "none";
      if (match) {
        card.classList.remove("pop-in");
        void card.offsetWidth; // force reflow
        card.classList.add("pop-in");
      }
    });
  });
}
