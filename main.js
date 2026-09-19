(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Kinetic delay attrs */
  document.querySelectorAll(".kinetic").forEach((el) => {
    const d = el.getAttribute("data-delay") || "0";
    el.style.setProperty("--d", d);
  });

  /* Chapter rail + scroll progress */
  const rail = document.querySelector(".chapter-rail");
  const railFill = document.getElementById("rail-fill");
  const chapters = [...document.querySelectorAll("[data-chapter]")].filter(
    (el) => el.id
  );
  const railLinks = [...document.querySelectorAll(".chapter-rail__nav a")];
  const topbar = document.querySelector(".topbar");

  if (rail && window.innerWidth > 900) rail.hidden = false;

  const setActiveChapter = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = chapters[0]?.id;
    for (const sec of chapters) {
      if (sec.offsetTop <= y) current = sec.id;
    }
    railLinks.forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === `#${current}`);
    });
    if (topbar) topbar.classList.toggle("is-solid", window.scrollY > 80);
    if (railFill) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * 100 : 0;
      railFill.style.height = `${Math.min(100, Math.max(0, p))}%`;
    }
  };

  /* Ken Burns + hero video — deferred until after LCP (CWV) */
  const slides = [...document.querySelectorAll(".film-slide")];
  let slideIdx = 0;
  let filmReady = false;
  const video = document.getElementById("hero-video");
  const unmuteBtn = document.getElementById("unmute-btn");

  function startFilmCycle() {
    if (filmReady || reduce || !slides.length) return;
    /* Mobile: keep still LCP — Ken Burns + video felt shaky */
    if (window.matchMedia("(max-width: 768px)").matches) return;
    filmReady = true;
    const lcp = document.querySelector(".film-lcp");
    if (lcp) {
      lcp.style.transition = "opacity .8s ease";
      lcp.style.opacity = "0";
    }
    slides[0].classList.add("is-active");
    setInterval(() => {
      slides[slideIdx].classList.remove("is-active");
      slideIdx = (slideIdx + 1) % slides.length;
      slides[slideIdx].classList.add("is-active");
    }, 7000);
    if (video) {
      const tryPlay = () => {
        video.muted = true;
        const play = video.play();
        if (play) play.then(() => video.classList.add("is-on")).catch(() => {});
      };
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) tryPlay();
              else video.pause();
            });
          },
          { threshold: 0.35 }
        );
        io.observe(video);
      } else {
        tryPlay();
      }
    }
  }
  if (unmuteBtn && video) {
    unmuteBtn.addEventListener("click", () => {
      /* Stay silent-only: no audio track expected; toggle film vs stills */
      const on = video.classList.toggle("is-on");
      unmuteBtn.classList.toggle("is-live", on);
      unmuteBtn.setAttribute("aria-pressed", String(on));
      unmuteBtn.innerHTML = on
        ? '<span class="mute-icon" aria-hidden="true"></span> Film on'
        : '<span class="mute-icon" aria-hidden="true"></span> Silent film';
      if (on) video.play().catch(() => {});
      else video.pause();
    });
  }

  /* Parallax */
  const parallaxEls = [...document.querySelectorAll(".parallax, .parallax-img")];
  const onScrollParallax = () => {
    if (reduce) return;
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.speed || "0.2");
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2 - vh / 2;
      const y = mid * speed * -0.15;
      if (el.classList.contains("parallax-img")) {
        el.style.transform = `translate3d(0, ${y}px, 0) scale(1.08)`;
      } else {
        el.style.backgroundPosition = `center calc(50% + ${y}px)`;
      }
    });
  };

  /* Hotspot tips */
  const bubble = document.getElementById("tip-bubble");
  const showTip = (text, x, y) => {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.hidden = false;
    const pad = 12;
    const bw = bubble.offsetWidth;
    const bh = bubble.offsetHeight;
    let left = x + 16;
    let top = y - bh - 10;
    if (left + bw > window.innerWidth - pad) left = x - bw - 16;
    if (top < pad) top = y + 20;
    bubble.style.left = `${Math.max(pad, left)}px`;
    bubble.style.top = `${Math.max(pad, top)}px`;
  };
  const hideTip = () => {
    if (bubble) bubble.hidden = true;
  };

  document.querySelectorAll(".hotspot").forEach((btn) => {
    const tip = btn.getAttribute("data-tip") || "";
    const show = (e) => {
      const cx = e.clientX ?? btn.getBoundingClientRect().left;
      const cy = e.clientY ?? btn.getBoundingClientRect().top;
      showTip(tip, cx, cy);
    };
    btn.addEventListener("mouseenter", show);
    btn.addEventListener("focus", (e) => {
      const r = btn.getBoundingClientRect();
      showTip(tip, r.left + r.width / 2, r.top);
    });
    btn.addEventListener("mouseleave", hideTip);
    btn.addEventListener("blur", hideTip);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      show(e);
      const swap = btn.getAttribute("data-swap");
      const main = document.getElementById("studio-main");
      const tipEl = document.getElementById("studio-tip");
      if (swap && main) {
        main.src = swap;
        main.alt = tip;
      }
      if (tipEl) {
        tipEl.textContent = tip;
        tipEl.classList.add("is-on");
      }
    });
  });

  /* Studio explore */
  const exploreBtn = document.getElementById("explore-studio");
  const explore = document.getElementById("studio-explore");
  if (exploreBtn && explore) {
    exploreBtn.addEventListener("click", () => {
      explore.hidden = false;
      explore.classList.add("is-open");
      explore.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      const tipEl = document.getElementById("studio-tip");
      if (tipEl) {
        tipEl.textContent = "Tap the gold markers to explore zones";
        tipEl.classList.add("is-on");
      }
    });
  }
  document.querySelectorAll(".studio-thumbs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.dataset.src;
      const alt = btn.dataset.alt || "";
      const main = document.getElementById("studio-main");
      if (main && src) {
        main.src = src;
        main.alt = alt;
      }
      document
        .querySelectorAll(".studio-thumbs button")
        .forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  /* Lazy-ish: below-fold videos */
  document.querySelectorAll(".reel-video").forEach((v) => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            v.load();
            io.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    io.observe(v);
  });

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setActiveChapter();
      onScrollParallax();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (rail) rail.hidden = window.innerWidth <= 900;
    setActiveChapter();
  });
  setActiveChapter();
  onScrollParallax();


  // Performance: hydrate film slides + hero video after first paint (CWV)
  function hydrateFilm() {
    var stage = document.getElementById("film-stage");
    if (!stage) return;
    stage.querySelectorAll(".film-slide[data-bg]").forEach(function (el) {
      var src = el.getAttribute("data-bg");
      if (src) el.style.backgroundImage = "url('" + src + "')";
    });
    var vid = document.getElementById("hero-video");
    if (vid) {
      var srcEl = vid.querySelector("source[data-src]");
      if (srcEl && !srcEl.getAttribute("src")) {
        srcEl.setAttribute("src", srcEl.getAttribute("data-src"));
        vid.load();
      }
    }
    setTimeout(startFilmCycle, 600);
  }
  if ("requestIdleCallback" in window) {
    requestIdleCallback(hydrateFilm, { timeout: 1800 });
  } else {
    window.addEventListener("load", function () {
      setTimeout(hydrateFilm, 400);
    });
  }



})();
