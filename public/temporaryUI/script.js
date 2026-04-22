const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  },
);

revealItems.forEach((item) => {
  if (!item.classList.contains("is-visible")) {
    revealObserver.observe(item);
  }
});

const tiltCards = document.querySelectorAll(".tilt-card");

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 8;
    const rotateX = (0.5 - py) * 8;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const parallaxItems = document.querySelectorAll("[data-parallax]");
const heroStage = document.querySelector(".hero-stage");
const siteHeader = document.querySelector(".site-header");
const heroLayers = heroStage
  ? {
      left: heroStage.querySelector(".hero-stage__left"),
      window: heroStage.querySelector(".hero-stage__window"),
      right: heroStage.querySelector(".hero-stage__right"),
    }
  : null;

const onParallax = () => {
  const scrollY = window.scrollY;

  parallaxItems.forEach((item) => {
    const depth = Number(item.dataset.parallax || 0);
    item.style.transform = `translate3d(0, ${scrollY * (depth / 1000)}px, 0)`;
  });

  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", scrollY > 12);
  }
};

onParallax();
window.addEventListener("scroll", onParallax, { passive: true });

if (heroStage && heroLayers?.left && heroLayers?.window && heroLayers?.right) {
  heroStage.addEventListener("pointermove", (event) => {
    const rect = heroStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    heroLayers.left.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0)`;
    heroLayers.window.style.transform = `translateX(-50%) translate3d(${x * -18}px, ${y * -12}px, 0)`;
    heroLayers.right.style.transform = `translate3d(${x * 12}px, ${y * -10}px, 0)`;
  });

  heroStage.addEventListener("pointerleave", () => {
    heroLayers.left.style.transform = "";
    heroLayers.window.style.transform = "";
    heroLayers.right.style.transform = "";
  });
}

document.querySelectorAll('a[href^="#"], button').forEach((element) => {
  element.addEventListener("click", () => {
    element.blur();
  });
});
