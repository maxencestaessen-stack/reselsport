(function () {
  var CATALOG = [
    { src: "maillots/m01.jpg", title: "Brésil domicile", tag: "Sél." },
    { src: "maillots/m02.jpg", title: "Argentine rayures", tag: "Sél." },
    { src: "maillots/m03.jpg", title: "Rayé rouge / blanc", tag: "Club" },
    { src: "maillots/m04.jpg", title: "Bleu col blanc", tag: "Club" },
    { src: "maillots/m05.jpg", title: "Noir or collector", tag: "Club" },
    { src: "maillots/m06.jpg", title: "Vert domicile", tag: "Club" },
    { src: "maillots/m07.jpg", title: "Blanc écusson", tag: "Club" },
    { src: "maillots/m08.jpg", title: "Milan domicile LS", tag: "Club" },
    { src: "maillots/m09.jpg", title: "Milan — dos 11", tag: "Club" },
    { src: "maillots/m10.jpg", title: "Argentine LS #5", tag: "Rétro" },
    { src: "maillots/m11.jpg", title: "City away or", tag: "Club" },
    { src: "maillots/m12.jpg", title: "Rail MLS archive", tag: "Mix" }
  ];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var grid = document.getElementById("vestiaire");
  if (grid) {
    var items = shuffle(CATALOG);
    var html = "";
    items.forEach(function (item, i) {
      var d = (i % 4) + 1;
      var base = item.src.replace(/\.jpg$/, "");
      var lazy = i < 4 ? "eager" : "lazy";
      html += '<article class="card reveal delay-' + d + '">' +
        '<div class="shot"><span class="tag">' + item.tag + '</span>' +
        '<img src="' + base + '-sm.jpg" ' +
        'srcset="' + base + '-sm.jpg 420w, ' + item.src + ' 900w" ' +
        'sizes="(max-width: 700px) 48vw, (max-width: 1100px) 30vw, 22vw" ' +
        'width="900" height="1125" alt="' + item.title + '" ' +
        'loading="' + lazy + '" decoding="async" /></div>' +
        '<div class="meta"><b>' + item.title + '</b><small>Case ' + String(i + 1).padStart(2, "0") + ' · check auth</small></div>' +
        '</article>';
    });
    grid.innerHTML = html;
    var sc = document.getElementById("stockCount");
    if (sc) sc.textContent = String(items.length);
  }
  var header = document.querySelector("header");
  var heroMedia = document.getElementById("heroMedia");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 24);
    if (heroMedia) {
      var h = heroMedia.parentElement ? heroMedia.parentElement.offsetHeight : 700;
      var p = Math.min(1, y / (h * 0.85));
      heroMedia.style.transform = "translateY(" + (y * 0.22) + "px) scale(" + (1 + p * 0.06) + ")";
      heroMedia.style.opacity = String(Math.max(0, 1 - p * 1.15));
    }
    ticking = false;
  }
  function requestTick() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }
  onScroll();
  window.addEventListener("scroll", requestTick, { passive: true });

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  var form = document.getElementById("estimate-form");
  var successBox = document.getElementById("form-success");
  var errorBox = document.getElementById("form-error");
  var submitBtn = document.getElementById("form-submit");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (successBox) successBox.hidden = true;
      if (errorBox) { errorBox.hidden = true; errorBox.textContent = ""; }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi…";
      }
      var data = new FormData(form);
      if (!data.get("form-name")) data.set("form-name", "estimation");
      fetch("/", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          var prev = document.getElementById("previews");
          if (prev) prev.innerHTML = "";
          if (successBox) {
            successBox.hidden = false;
            successBox.textContent = "Demande envoyée. On te répond sous 24h.";
            successBox.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          if (errorBox) {
            errorBox.hidden = false;
            errorBox.textContent = "Envoi refusé. Le site doit être en ligne sur Netlify (pas en fichier local).";
          }
        }
      }).catch(function () {
        if (errorBox) {
          errorBox.textContent = "Pas de réseau, ou page ouverte en local. Déploie sur Netlify puis réessaie.";
          errorBox.hidden = false;
        }
      }).then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Demander mon prix";
        }
      });
    });
  }

  var input = document.getElementById("photos");
  var zone = document.getElementById("dropzone");
  var previews = document.getElementById("previews");
  if (!input || !zone || !previews) return;

  var MAX_FILES = 8;
  var MAX_SIZE = 8 * 1024 * 1024;

  function render(files) {
    previews.innerHTML = "";
    Array.prototype.forEach.call(files, function (file) {
      if (!file.type || file.type.indexOf("image/") !== 0) return;
      var img = document.createElement("img");
      img.alt = file.name;
      img.src = URL.createObjectURL(file);
      previews.appendChild(img);
    });
  }

  function filterList(fileList) {
    var ok = [];
    Array.prototype.forEach.call(fileList, function (file) {
      if (file.type.indexOf("image/") !== 0) return;
      if (file.size > MAX_SIZE) return;
      if (ok.length < MAX_FILES) ok.push(file);
    });
    var dt = new DataTransfer();
    ok.forEach(function (f) { dt.items.add(f); });
    input.files = dt.files;
    render(input.files);
  }

  input.addEventListener("change", function () {
    filterList(input.files);
  });

  ["dragenter", "dragover"].forEach(function (evt) {
    zone.addEventListener(evt, function (e) {
      e.preventDefault();
      zone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    zone.addEventListener(evt, function () {
      zone.classList.remove("dragover");
    });
  });
  zone.addEventListener("drop", function (e) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files) filterList(e.dataTransfer.files);
  });
})();
