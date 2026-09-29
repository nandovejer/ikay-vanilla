// TESTING FOO
// CSS testing no support: paint every card as "not supported"
const testing = () => {
  document.querySelectorAll(".card").forEach((item) => {
    item.classList.add("noSupport");
  });
};

export default testing;
