import { getProjectBySlug, type Project } from "../data/projects";
import { navigate } from "../router";
import { playIcon, chevronLeftIcon, chevronRightIcon } from "../assets/icons";

export function renderDetail(container: HTMLElement, slug: string): void {
  const project = getProjectBySlug(slug);
  if (!project) {
    container.innerHTML = `<div class="not-found"><p>Project not found.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-page">
      ${renderVideoHeader(project)}
      <div class="detail-content">
        <div class="detail-info">
          <div class="detail-meta">
            <img
              class="detail-icon"
              src="${project.iconPath}"
              alt="${project.name} icon"
              onerror="this.style.display='none'"
            />
            <h2 class="detail-name">${project.name}</h2>
          </div>
          <p class="detail-description">${project.description}</p>
        </div>
        ${renderScreenshotCarousel(project)}
      </div>
      <button class="play-btn" id="play-btn" aria-label="Play ${project.name}">
        ${playIcon()}
        <span>Play</span>
      </button>
    </div>
  `;

  // Play button handler
  document.getElementById("play-btn")!.addEventListener("click", () => {
    navigate(`/project/${slug}/play`);
  });

  // Carousel navigation
  initCarouselNav();
}

function renderVideoHeader(project: Project): string {
  if (project.videoUrl) {
    return `
      <div class="detail-video-header">
        <video autoplay muted loop playsinline>
          <source src="${project.videoUrl}" type="video/mp4" />
        </video>
      </div>
    `;
  }

  // Fallback: blurred boxart banner
  return `
    <div class="detail-video-header detail-video-fallback">
      <img
        src="${project.boxartPath}"
        alt=""
        class="fallback-bg"
        onerror="this.style.display='none'"
      />
      <div class="fallback-overlay"></div>
      <div class="fallback-icon-wrapper">
        <img
          src="${project.iconPath}"
          alt="${project.name}"
          class="fallback-center-icon"
          onerror="this.style.display='none'"
        />
      </div>
    </div>
  `;
}

function renderScreenshotCarousel(project: Project): string {
  if (!project.screenshots.length) {
    return `
      <div class="carousel-section">
        <h3 class="carousel-title">Screenshots</h3>
        <div class="carousel-empty">
          <p>No screenshots available yet.</p>
        </div>
      </div>
    `;
  }

  const slides = project.screenshots
    .map(
      (src, i) => `<img class="carousel-slide" src="${src}" alt="Screenshot ${i + 1}" loading="lazy" />`
    )
    .join("");

  return `
    <div class="carousel-section">
      <h3 class="carousel-title">Screenshots</h3>
      <div class="carousel-wrapper">
        <button class="carousel-btn carousel-prev" aria-label="Previous screenshot">${chevronLeftIcon()}</button>
        <div class="carousel-track" id="carousel-track">
          ${slides}
        </div>
        <button class="carousel-btn carousel-next" aria-label="Next screenshot">${chevronRightIcon()}</button>
      </div>
    </div>
  `;
}

function initCarouselNav(): void {
  const track = document.getElementById("carousel-track");
  if (!track) return;

  const prev = document.querySelector<HTMLButtonElement>(".carousel-prev");
  const next = document.querySelector<HTMLButtonElement>(".carousel-next");

  prev?.addEventListener("click", () => {
    track.scrollBy({ left: -300, behavior: "smooth" });
  });

  next?.addEventListener("click", () => {
    track.scrollBy({ left: 300, behavior: "smooth" });
  });
}
