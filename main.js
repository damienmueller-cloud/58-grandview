(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightbox-img");
  var lbClose = document.getElementById("lightbox-close");
  function closeLb() {
    if (!lb) return;
    lb.classList.remove("open");
    if (lbImg) { lbImg.src = ""; lbImg.alt = ""; }
  }
  document.querySelectorAll("[data-lightbox]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (!lb || !lbImg) return;
      lbImg.src = a.getAttribute("href");
      var img = a.querySelector("img");
      lbImg.alt = img ? img.alt : "";
      lb.classList.add("open");
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLb();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLb();
  });
})();
