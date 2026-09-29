import choiceLang from "./choiceLang.js";

const navMenu = {
  init() {
    const btnMenu = document.querySelector(".js-bntMenu");
    const navScope = document.querySelector(".js-navMenu");
    const btnMenuClose = navScope.querySelector(".js-bntMenuClose");
    const openMenu = "openMenu";

    const toggleMenu = (open) => {
      navScope.classList.toggle(openMenu, open);
      btnMenu.classList.toggle(openMenu, open);
      btnMenu.setAttribute("aria-expanded", open);
    };

    // Events
    choiceLang.init();
    btnMenu.addEventListener("click", () => toggleMenu(true));
    btnMenuClose.addEventListener("click", () => toggleMenu(false));
    document.querySelectorAll(".js-navMenu-link").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        const anchor = document.querySelector(item.getAttribute("href"));
        const headerHeight = document.getElementById("appHeader").offsetHeight + 20;
        anchor.focus({ preventScroll: true });
        window.scrollTo({
          top: anchor.getBoundingClientRect().top + window.scrollY - headerHeight,
          behavior: "smooth",
        });
        toggleMenu(false);
      });
    });
  },
};

export default navMenu;
