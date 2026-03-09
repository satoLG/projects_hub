import { getProjectBySlug } from "../data/projects";

export function renderPlay(container: HTMLElement, slug: string): void {
  const project = getProjectBySlug(slug);
  if (!project) {
    container.innerHTML = `<div class="not-found"><p>Project not found.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="play-container" id="play-container">
      <iframe
        id="app-iframe"
        src="${project.url}"
        title="${project.name}"
        allowfullscreen
      ></iframe>
    </div>
  `;

  // Trigger smooth open after insertion
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById("play-container")?.classList.add("open");
    });
  });
}
