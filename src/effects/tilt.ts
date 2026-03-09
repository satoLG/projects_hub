const TILT_MAX = 10; // degrees
const SCALE_HOVER = 1.05;

export function applyTiltEffect(card: HTMLElement): void {
  const inner = card.querySelector<HTMLElement>(".card-inner");
  if (!inner) return;

  let rect: DOMRect;
  let shine: HTMLElement | null = null;

  card.addEventListener("mouseenter", () => {
    rect = card.getBoundingClientRect();
    card.style.transition = "transform 0.15s ease-out";
    card.style.transform = `scale(${SCALE_HOVER})`;
    card.style.zIndex = "10";

    // Create shine overlay
    if (!shine) {
      shine = document.createElement("div");
      shine.className = "card-shine";
      inner.appendChild(shine);
    }
    shine.style.opacity = "1";
  });

  card.addEventListener("mousemove", (e: MouseEvent) => {
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -TILT_MAX;
    const rotateY = ((x - centerX) / centerX) * TILT_MAX;

    card.style.transition = "none";
    card.style.transform = `perspective(600px) scale(${SCALE_HOVER}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Move shine
    if (shine) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,255,255,0.18) 0%, transparent 60%)`;
    }
  });

  card.addEventListener("mouseleave", () => {
    card.style.transition = "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    card.style.transform = "";
    card.style.zIndex = "";

    if (shine) {
      shine.style.opacity = "0";
    }
  });
}
