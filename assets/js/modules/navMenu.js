/**
 * Section navigation.
 * - Small screens: an off-canvas panel built on the Popover API
 *   (popovertarget in the markup: light dismiss, Esc and focus for free).
 *   Browsers without popover fall back to the .openMenu class.
 * - Wide screens: the same <nav> is a sticky sidebar with scroll spy.
 */
import choiceLang from "./choiceLang.js";

const SUPPORTS_POPOVER = Object.hasOwn(HTMLElement.prototype, "popover");
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const navMenu = {
  init() {
    const btnMenu = document.querySelector(".js-bntMenu");
    const navScope = document.querySelector(".js-navMenu");
    const btnMenuClose = navScope.querySelector(".js-bntMenuClose");
    const openMenu = "openMenu";

    const isOpen = () =>
      SUPPORTS_POPOVER ? navScope.matches(":popover-open") : navScope.classList.contains(openMenu);

    const sync = (open) => {
      navScope.classList.toggle(openMenu, open);
      btnMenu.classList.toggle(openMenu, open);
      btnMenu.setAttribute("aria-expanded", open);
    };

    const toggleMenu = (open) => {
      if (SUPPORTS_POPOVER) {
        if (open !== isOpen()) navScope.togglePopover(open);
      } else {
        sync(open);
      }
    };

    // Events
    choiceLang.init();
    if (SUPPORTS_POPOVER) {
      navScope.addEventListener("toggle", (event) => sync(event.newState === "open"));
    } else {
      navScope.removeAttribute("popover");
      btnMenu.addEventListener("click", () => toggleMenu(true));
      btnMenuClose.addEventListener("click", () => toggleMenu(false));
    }

    document.querySelectorAll(".js-navMenu-link").forEach((item) => {
      item.addEventListener("click", (event) => {
        const anchor = document.querySelector(item.getAttribute("href"));
        if (!anchor) return;
        event.preventDefault();
        if (isOpen()) toggleMenu(false);
        // html { scroll-padding-block-start } (css) leaves room for the sticky header
        anchor.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
        anchor.focus({ preventScroll: true });
      });
    });

    // Growing into the sidebar layout closes the off-canvas panel
    matchMedia("(min-width: 70em)").addEventListener("change", (event) => {
      if (event.matches && isOpen()) toggleMenu(false);
    });

    navMenu.scrollSpy(navScope);
  },
  /** aria-current on the link of the section being read */
  scrollSpy(navScope) {
    if (!("IntersectionObserver" in window)) return;
    const links = new Map();
    navScope.querySelectorAll(".js-navMenu-link").forEach((link) => {
      const heading = document.querySelector(link.getAttribute("href"));
      const section = heading?.closest("section");
      if (section) links.set(section, link);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => link.removeAttribute("aria-current"));
          links.get(entry.target)?.setAttribute("aria-current", "location");
        });
      },
      // a thin band a third of the way down the viewport
      { rootMargin: "-30% 0px -65% 0px" }
    );
    links.forEach((_, section) => observer.observe(section));
  },
};

export default navMenu;
