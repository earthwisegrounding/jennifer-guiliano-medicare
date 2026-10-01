/* Small, dependency-free enhancements. The site works fully without JavaScript
   (menus fall back to always-visible lists; forms fall back to native validation). */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.querySelector(".menu-label").textContent = open ? "Menu" : "Close";
      nav.classList.toggle("open", !open);
    });
  }

  /* ---------- Desktop dropdowns (click/keyboard, never hover-only) ---------- */
  var subToggles = Array.prototype.slice.call(document.querySelectorAll(".sub-toggle"));
  function closeAll(except) {
    subToggles.forEach(function (btn) {
      if (btn === except) return;
      btn.setAttribute("aria-expanded", "false");
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.classList.remove("open");
    });
  }
  subToggles.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = btn.getAttribute("aria-expanded") === "true";
      closeAll(btn);
      btn.setAttribute("aria-expanded", String(!open));
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.classList.toggle("open", !open);
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".has-sub")) closeAll();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openBtn = subToggles.filter(function (b) { return b.getAttribute("aria-expanded") === "true"; })[0];
    closeAll();
    if (openBtn) openBtn.focus();
    if (toggle && toggle.getAttribute("aria-expanded") === "true") { toggle.click(); toggle.focus(); }
  });
  document.querySelectorAll(".has-sub").forEach(function (li) {
    li.addEventListener("focusout", function (e) {
      if (!li.contains(e.relatedTarget)) {
        var btn = li.querySelector(".sub-toggle");
        if (btn && btn.getAttribute("aria-expanded") === "true") closeAll();
      }
    });
  });

  /* ---------- Click-to-load YouTube video ----------
     Nothing loads from YouTube until Play is pressed. Without JavaScript the link opens YouTube. */
  document.querySelectorAll(".video-facade[data-youtube-id]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(link.getAttribute("data-youtube-id")) + "?autoplay=1&rel=0";
      iframe.title = link.getAttribute("data-title") || "Video";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      link.replaceWith(iframe);
      iframe.focus();
    });
  });

  /* ---------- Lead form (PLACEHOLDER — not connected to any endpoint yet) ---------- */
  document.querySelectorAll("form[data-placeholder-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (status) {
        status.textContent =
          "Thank you! Online requests aren't switched on yet, so this form didn't send. " +
          "Please call (623) 286-4191 or email jennifer.insurancegroup@gmail.com — Jennifer will be glad to help.";
        status.focus();
      }
    });
  });
})();
