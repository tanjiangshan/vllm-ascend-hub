/* V2: dependency-free rendering, navigation and technical step demos. */
(function () {
  "use strict";
  var data = window.SPEC_V2 || {};
  var chapters = Array.from(document.querySelectorAll("main > .chapter"));
  var navLinks = Array.from(document.querySelectorAll(".chapter-nav a"));
  var printState = [];

  function esc(value) {
    return String(value).replace(/[&<>'"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c];
    });
  }
  function byId(id) { return document.getElementById(id); }
  function renderTimeline() {
    var root = byId("timeline");
    if (!root) return;
    root.innerHTML = (data.timeline || []).map(function (item) {
      return '<article class="timeline-item' + (item.focus ? " focus" : "") + '">' +
        '<time class="timeline-date">' + esc(item.date) + "</time>" +
        "<h3>" + esc(item.title) + "</h3><p>" + esc(item.text) + "</p>" +
        '<a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">公开来源 ↗</a></article>';
    }).join("");
  }
  function renderMethodText(value, dialogId) {
    if (!dialogId) return esc(value);
    return '<button type="button" class="glossary-link" data-dialog-open="' + esc(dialogId) + '" aria-haspopup="dialog" aria-controls="' + esc(dialogId) + '" aria-label="查看配置与约束说明" title="点击查看详细说明">' + esc(value) + '</button>';
  }
  function renderMethodMatrix() {
    var root = byId("methodMatrixBody");
    if (!root) return;
    root.innerHTML = (data.methods || []).map(function (row) {
      return "<tr><td>" + esc(row.name) + "</td><td>" + renderMethodText(row.rc, row.rcDialog) + "</td><td>" + renderMethodText(row.main, row.mainDialog) + "</td></tr>";
    }).join("");
  }
  function renderModelEvidence() {
    var root = byId("modelEvidenceBody");
    if (!root) return;
    root.innerHTML = (data.modelEvidence || []).map(function (row) {
      return "<tr><td>" + esc(row.family) + "</td><td><strong>" + esc(row.model) + "</strong><br><span class=\"small muted\">" + esc(row.evidence) + "</span></td>" +
        '<td class="evidence-cell">' + esc(row.mtp) + '</td><td class="evidence-cell">' + esc(row.dflash) + '</td><td class="evidence-cell">' + esc(row.dspark) + '</td><td class="evidence-cell">' + esc(row.dflash2) + "</td></tr>";
    }).join("");
  }
  function setupThemeToggle() {
    var button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    function sync() {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      button.textContent = dark ? "切换浅色" : "切换暗色";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "切换到浅色主题" : "切换到暗色主题");
    }
    button.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      sync();
    });
    sync();
  }

  function setupDialogs() {
    document.querySelectorAll("[data-dialog-open]").forEach(function (button) {
      function openDialog() {
        var dialog = byId(button.getAttribute("data-dialog-open"));
        if (!dialog) return;
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      }
      button.addEventListener("click", openDialog);
      if (button.getAttribute("role") === "button" && button.tagName.toLowerCase() !== "button") {
        button.addEventListener("keydown", function (event) {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          openDialog();
        });
      }
    });
    document.querySelectorAll("dialog").forEach(function (dialog) {
      dialog.querySelectorAll("[data-dialog-close]").forEach(function (button) {
        button.addEventListener("click", function () {
          if (typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
        });
      });
      dialog.addEventListener("click", function (event) {
        if (event.target !== dialog) return;
        var rect = dialog.getBoundingClientRect();
        var inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (!inside && typeof dialog.close === "function") dialog.close();
      });
    });
  }

  function updateProgress() {
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var percent = height > 0 ? Math.min(100, Math.max(0, window.scrollY / height * 100)) : 0;
    var bar = document.querySelector(".progress span");
    var label = document.querySelector(".reading-status");
    if (bar) bar.style.width = percent.toFixed(2) + "%";
    if (label) label.textContent = "阅读进度 " + Math.round(percent) + "%";
  }
  function setActive(id) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    var select = byId("mobileChapterSelect");
    if (select && select.value !== id) select.value = id;
  }
  function observeChapters() {
    if (!("IntersectionObserver" in window)) return;
    var visible = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
        else visible.delete(entry.target.id);
      });
      if (!visible.size) return;
      var current = Array.from(visible.entries()).sort(function (a, b) {
        return Math.abs(a[1] - 90) - Math.abs(b[1] - 90);
      })[0];
      setActive(current[0]);
    }, { rootMargin: "-70px 0px -55% 0px", threshold: [0, .05, .2] });
    chapters.forEach(function (chapter) { observer.observe(chapter); });
  }
  function setupNavigation() {
    var select = byId("mobileChapterSelect");
    if (select) {
      chapters.forEach(function (chapter) {
        var option = document.createElement("option");
        option.value = chapter.id;
        option.textContent = chapter.querySelector("h2").textContent;
        select.appendChild(option);
      });
      select.addEventListener("change", function () {
        var target = byId(select.value);
        if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
      });
    }
    document.querySelectorAll("[data-print]").forEach(function (button) {
      button.addEventListener("click", function () { window.print(); });
    });
    document.querySelectorAll("[data-top]").forEach(function (button) {
      button.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    });
    var expand = document.querySelector("[data-expand-details]");
    if (expand) expand.addEventListener("click", function () {
      var details = Array.from(document.querySelectorAll("details"));
      var open = details.some(function (item) { return !item.open; });
      details.forEach(function (item) { item.open = open; });
      expand.textContent = open ? "收起扩展内容" : "展开扩展内容";
    });
  }
  function fallbackCopy(text, button) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var copied = false;
    try { copied = document.execCommand("copy"); } catch (error) { copied = false; }
    area.remove();
    button.textContent = copied ? "已复制" : "请手动复制";
  }
  function setupCodeCopy() {
    document.querySelectorAll("pre").forEach(function (pre) {
      var text = pre.textContent;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");
      button.addEventListener("click", function () {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () { button.textContent = "已复制"; }).catch(function () { fallbackCopy(text, button); });
        } else fallbackCopy(text, button);
        window.setTimeout(function () { button.textContent = "复制"; }, 1600);
      });
      pre.appendChild(button);
    });
  }
  function setupPrint() {
    window.addEventListener("beforeprint", function () {
      printState = Array.from(document.querySelectorAll("details")).map(function (item) { return item.open; });
      document.querySelectorAll("details").forEach(function (item) { item.open = true; });
      document.querySelectorAll(".copy-code").forEach(function (item) { item.hidden = true; });
    });
    window.addEventListener("afterprint", function () {
      document.querySelectorAll("details").forEach(function (item, index) { item.open = Boolean(printState[index]); });
    });
  }
  function outputHtml(outputs) {
    if (!outputs || !outputs.length) return '<span class="muted small">尚未产生</span>';
    return outputs.map(function (output) {
      var suffix = output.position ? "@" + output.position : "";
      return '<span class="demo-output-token ' + esc(output.kind || "accepted") + '">' + esc(output.text) + suffix + "</span>";
    }).join("");
  }
  function makeController(options) {
    var index = 0;
    var path = options.initialPath;
    function render() {
      var steps = typeof options.steps === "function" ? options.steps(path) : options.steps;
      var step = steps[index];
      options.render(step, path, index, steps.length);
    }
    function move(delta) {
      var steps = typeof options.steps === "function" ? options.steps(path) : options.steps;
      index = Math.max(0, Math.min(steps.length - 1, index + delta));
      render();
    }
    options.root.querySelectorAll("[data-demo-path]").forEach(function (button) {
      button.addEventListener("click", function () {
        path = button.getAttribute("data-demo-path");
        index = 0;
        render();
      });
    });
    options.root.querySelector("[data-prev]").addEventListener("click", function () { move(-1); });
    options.root.querySelector("[data-next]").addEventListener("click", function () { move(1); });
    options.root.querySelector("[data-reset]").addEventListener("click", function () { index = 0; render(); });
    options.root.hidden = false;
    document.body.classList.add(options.bodyClass);
    render();
  }

  function setupBonusDemo() {
    var root = byId("bonusDemo");
    if (!root || !data.bonusDemo) return;
    var tokens = ["a₀", "d₁", "d₂", "d₃", "d₄"];
    var logits = ["a₀ logits", "d₁ logits", "d₂ logits", "d₃ logits", "d₄ logits"];
    makeController({
      root: root,
      initialPath: "all",
      bodyClass: "has-bonus-demo",
      steps: function (path) { return data.bonusDemo[path]; },
      render: function (step, path, index, total) {
        byId("bonusTokens").innerHTML = tokens.map(function (token, i) {
          var state = step.accepted.indexOf(i) >= 0 ? "accepted" : step.rejected.indexOf(i) >= 0 ? "rejected" : "pending";
          if (step.active === i) state += " active";
          if (step.rejected.indexOf(i) >= 0) {
            var correction = step.outputs.find(function (o) { return o.kind === "correction"; });
            return '<div class="demo-cell rejected"><strong>' + token + ' → ' + esc(correction.text) + '</strong><small>拒绝并修正</small></div>';
          }
          return '<div class="demo-cell ' + state + '"><strong>' + token + '</strong><small>' + (i === 0 ? "已确认" : "draft") + "</small></div>";
        }).join("");
        byId("bonusLogits").innerHTML = logits.map(function (logit, i) {
          return '<div class="demo-cell ' + (step.logit.indexOf(i) >= 0 ? "logit-active" : "pending") + '"><strong>' + logit + '</strong><small>' + (i < 4 ? "验证 d" + (i + 1) : "预测 bonus") + "</small></div>";
        }).join("");
        byId("bonusStepNo").textContent = "第 " + (index + 1) + " / " + total + " 步";
        byId("bonusStepTitle").textContent = step.title;
        byId("bonusStepText").textContent = step.text;
        byId("bonusCount").textContent = step.outputs.length;
        byId("bonusOutputs").innerHTML = outputHtml(step.outputs);
        byId("bonusPrev").disabled = index === 0;
        byId("bonusNext").disabled = index === total - 1;
        root.querySelectorAll("[data-demo-path]").forEach(function (button) {
          button.setAttribute("aria-pressed", String(button.getAttribute("data-demo-path") === path));
        });
      }
    });
  }

  function setupMtpDemo() {
    var root = byId("mtpDemo");
    if (!root || !data.mtpDemo) return;
    var cards = ["输入 hₚ + a@(P+1)", "第 1 步", "第 2 步", "第 3 步"];
    makeController({
      root: root,
      initialPath: "single",
      bodyClass: "has-mtp-demo",
      steps: function (path) { return data.mtpDemo[path]; },
      render: function (step, path, index, total) {
        byId("mtpSteps").innerHTML = cards.map(function (card, cardIndex) {
          var state = "pending";
          if (step.active === null) state = cardIndex === 0 ? "active" : "pending";
          else if (cardIndex <= step.active) state = "accepted";
          else if (cardIndex === step.active + 1) state = "active";
          var module = cardIndex === 0 ? "target input" : data.mtpDemo[path][cardIndex].module;
          var output = cardIndex > 0 && step.outputs.length >= cardIndex ? step.outputs[cardIndex - 1] : null;
          return '<div class="demo-cell ' + state + '"><strong>' + esc(module) + '</strong><small>' + card + '</small>' +
            (output ? '<span class="token accept">' + esc(output.text) + "@" + esc(output.position) + "</span>" : "") + "</div>";
        }).join("");
        byId("mtpStepNo").textContent = "第 " + (index + 1) + " / " + total + " 步";
        byId("mtpStepTitle").textContent = step.title;
        byId("mtpStepText").textContent = step.text;
        byId("mtpCount").textContent = step.outputs.length;
        byId("mtpOutputs").innerHTML = outputHtml(step.outputs);
        byId("mtpPrev").disabled = index === 0;
        byId("mtpNext").disabled = index === total - 1;
        root.querySelectorAll("[data-demo-path]").forEach(function (button) {
          button.setAttribute("aria-pressed", String(button.getAttribute("data-demo-path") === path));
        });
      }
    });
  }

  function setupDsparkDemo() {
    var root = byId("dsparkDemo");
    if (!root || !data.dsparkDemo) return;
    var candidates = [
      { token: "D", c: "anchor" },
      { token: "E", c: ".96" },
      { token: "F", c: ".88" },
      { token: "G", c: ".72" },
      { token: "H", c: ".31" }
    ];
    makeController({
      root: root,
      initialPath: "default",
      bodyClass: "has-dspark-demo",
      steps: data.dsparkDemo,
      render: function (step, path, index, total) {
        byId("dsparkCandidates").innerHTML = candidates.map(function (candidate, i) {
          var state = "pending";
          if (step.active === "survival") state = "logit-active";
          else if (step.active === "baseline") state = i === 0 ? "accepted" : "pending";
          else if (step.active === "schedule" || step.active === "stop") {
            if (i === 0) state = "accepted";
            else if (i <= step.admitted) state = "admitted";
            else if (step.active === "stop" && i === 4) state = "dropped";
          } else if (step.active === "verify") {
            state = i === 3 ? "rejected" : i === 4 ? "dropped" : "accepted";
          } else if (i === 0) state = "accepted";
          var labels = { accepted: i === 0 ? "anchor · 已确认" : "target accepted", admitted: "admitted · 待验证", dropped: "scheduler dropped", rejected: "target rejected", pending: "pending", "logit-active": "confidence → survival" };
          return '<div class="demo-cell ' + state + '"><strong>' + candidate.token + '</strong><small>' + candidate.c + ' · ' + (labels[state] || state) + '</small></div>';
        }).join("");
        byId("dsparkStepNo").textContent = "第 " + (index + 1) + " / " + total + " 步";
        byId("dsparkStepTitle").textContent = step.title;
        byId("dsparkStepText").textContent = step.text;
        byId("dsparkOutputs").innerHTML = outputHtml(step.outputs);
        byId("dsparkPrev").disabled = index === 0;
        byId("dsparkNext").disabled = index === total - 1;
      }
    });
  }

  function setupSelectorDemo() {
    var root = byId("selectorDemo");
    if (!root || !data.selectorDemo) return;
    var grid = [
      ["decoding", "speculative", "slow"],
      ["decoding", "thinking", "models"],
      ["<eos>", "again", "…"]
    ];
    var selected = { 1: [[0, 1]], 2: [[0, 1], [1, 0]], 3: [[0, 1], [1, 0], [2, 0]] };
    makeController({
      root: root,
      initialPath: "default",
      bodyClass: "has-selector-demo",
      steps: data.selectorDemo,
      render: function (step, path, index, total) {
        byId("selectorGrid").innerHTML = grid.map(function (row, rowIndex) {
          return row.map(function (token, colIndex) {
            var reached = typeof step.active === "number" ? rowIndex + 1 <= step.active : step.active === "verify";
            var chosen = reached && selected[rowIndex + 1].some(function (pair) { return pair[0] === rowIndex && pair[1] === colIndex; });
            return '<div class="demo-cell ' + (chosen ? "admitted" : "pending") + '"><strong>' + esc(token) + (chosen ? " ✓" : "") + '</strong><small>候选 ' + String.fromCharCode(65 + colIndex) + '</small></div>';
          }).join("");
        }).join("");
        byId("selectorStepNo").textContent = "第 " + (index + 1) + " / " + total + " 步";
        byId("selectorStepTitle").textContent = step.title;
        byId("selectorStepText").textContent = step.text;
        byId("selectorOutputs").innerHTML = outputHtml(step.outputs);
        byId("selectorPrev").disabled = index === 0;
        byId("selectorNext").disabled = index === total - 1;
      }
    });
  }

  renderTimeline();
  renderMethodMatrix();
  renderModelEvidence();
  setupThemeToggle();
  setupNavigation();
  setupDialogs();
  setupCodeCopy();
  setupPrint();
  setupBonusDemo();
  setupMtpDemo();
  setupDsparkDemo();
  setupSelectorDemo();
  observeChapters();
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  if (chapters.length) setActive(chapters[0].id);
})();
