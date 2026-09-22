/**
 * Noumi Use Case 展示站 · app.js
 * 渲染 / hover 切换 / 英文展示 / toast / 灯箱大图。
 * 所有浏览器 URL 使用 new URL(..., document.baseURI) 解析，禁止根绝对路径。
 * 图片类附件（输入缩略图 / 产出物截图）点击后在当前页全屏灯箱打开原图，
 * 右上角关闭按钮 / 点击背景 / 按 Esc 均可退出。
 */
(function () {
  "use strict";

  var CATEGORIES = [];
  var HOVER_DEBOUNCE_MS = 60;
  var FADE_MS = 120;

  var state = {
    lang: "en",
    catIndex: 0,
    caseIndex: 0,
    hoverMode: false,
  };

  var els = {};
  var hoverTimer = null;
  var toastTimer = null;
  var resizeTimer = null;
  var caseTimer = null;
  var previousFocus = null;

  function t(field) {
    if (!field) return "";
    return field.en || "";
  }

  function resolveAsset(relPath) {
    return new URL(relPath, document.baseURI).toString();
  }

  // Known third-party connectors get their real brand mark instead of an
  // emoji placeholder; anything database-like gets a generic DB glyph
  // (tinted with the connector's own `color`). Matched by connector name,
  // not by an extra JSON field, so existing case content doesn't change.
  var BRAND_ICONS = [
    { match: /gmail/i, src: "assets/icons/gmail.png", bg: "#ffffff" },
    { match: /google drive/i, src: "assets/icons/drive.png", bg: "#ffffff" }
  ];
  var DB_ICON_RE = /(postgres|mysql|maria|sqlite|mongo|oracle|redis|database|数据库)/i;

  function getConnectorIcon(conn) {
    var name = (conn.name && (conn.name.en || "") + " " + (conn.name.zh || "")) || "";
    for (var i = 0; i < BRAND_ICONS.length; i++) {
      if (BRAND_ICONS[i].match.test(name)) return BRAND_ICONS[i];
    }
    if (DB_ICON_RE.test(name)) {
      return { src: "assets/icons/database.svg", bg: conn.color || "#6e86a4" };
    }
    return null;
  }

  /* ---------------- Rich text for the user prompt bubble ----------------
     Minimal, safe formatter: escapes HTML first, then linkifies emails and
     URLs, and turns consecutive "N. ..." lines into a real <ol>. Everything
     else stays a plain block line (visually equivalent to the old
     white-space: pre-line behavior for single-line prompts). */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var EMAIL_RE = /([\w.+-]+@[\w-]+\.[\w.-]+)/g;
  var URL_RE = /(https?:\/\/[^\s<]+)/g;
  // "==highlighted phrase==" authoring markup, rendered as an inline highlight.
  var HIGHLIGHT_RE = /==(.+?)==/g;
  // "@" mention of a file, e.g. "@Template_Blueprint.docx". Excludes emails
  // via the lookbehind (an email's "@" is always preceded by a local-part char).
  var FILE_REF_RE = /(?<![\w.+-])@([\w][\w.\-]*\.[A-Za-z0-9]{1,6})\b/g;

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Builds a regex matching "@<folder name>" for the given case's actual
  // artifact folder names (both languages), rather than guessing from
  // capitalization — folder names can contain lowercase words (e.g.
  // "Meeting notes"), which a Title-Case heuristic would mis-split.
  function buildFolderRefRe(folderNames) {
    if (!folderNames || !folderNames.length) return null;
    var sorted = folderNames.slice().sort(function (a, b) {
      return b.length - a.length;
    });
    var pattern = sorted.map(function (n) {
      return escapeRegExp(escapeHtml(n));
    }).join("|");
    return new RegExp("(?<![\\w.+-])@(" + pattern + ")\\b", "g");
  }

  function linkifyLine(rawLine, folderRefRe) {
    var escaped = escapeHtml(rawLine);
    escaped = escaped.replace(HIGHLIGHT_RE, function (m, inner) {
      return '<mark class="msg-highlight">' + inner + "</mark>";
    });
    if (folderRefRe) {
      escaped = escaped.replace(folderRefRe, function (m) {
        return '<span class="msg-file-ref"><span class="msg-file-ref-icon">📁</span>' + m + "</span>";
      });
    }
    escaped = escaped.replace(FILE_REF_RE, function (m) {
      return '<span class="msg-file-ref"><span class="msg-file-ref-icon">📄</span>' + m + "</span>";
    });
    escaped = escaped.replace(EMAIL_RE, function (m) {
      return '<a href="mailto:' + m + '">' + m + "</a>";
    });
    escaped = escaped.replace(URL_RE, function (m) {
      return '<a href="' + m + '" target="_blank" rel="noopener">' + m + "</a>";
    });
    return escaped;
  }

  function formatMessageText(text, folderNames) {
    var folderRefRe = buildFolderRefRe(folderNames);
    var lines = String(text || "").split("\n");
    var html = "";
    var listBuffer = [];

    function flushList() {
      if (!listBuffer.length) return;
      html += "<ol class=\"msg-list\">" + listBuffer.map(function (item) {
        return "<li>" + linkifyLine(item, folderRefRe) + "</li>";
      }).join("") + "</ol>";
      listBuffer = [];
    }

    lines.forEach(function (line) {
      if (line === "") {
        flushList();
        return;
      }
      var match = /^\d+\.\s+(.*)$/.exec(line);
      if (match) {
        listBuffer.push(match[1]);
      } else {
        flushList();
        html += '<div class="msg-line">' + linkifyLine(line, folderRefRe) + "</div>";
      }
    });
    flushList();

    return html;
  }

  function fetchJSON(relPath) {
    return fetch(resolveAsset(relPath)).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + relPath + ": " + res.status);
      return res.json();
    });
  }

  function loadContent() {
    return fetchJSON("assets/content/manifest.json").then(function (manifest) {
      var catDefs = manifest.categories || [];
      return Promise.all(
        catDefs.map(function (catDef) {
          return Promise.all(
            catDef.cases.map(function (caseId) {
              return fetchJSON("assets/content/cases/" + caseId + ".json");
            })
          ).then(function (cases) {
            return {
              id: catDef.id,
              icon: catDef.icon,
              iconColor: catDef.iconColor,
              label: catDef.label,
              cases: cases,
            };
          });
        })
      ).then(function (categories) {
        CATEGORIES = categories;
      });
    });
  }

  function cacheEls() {
    els.heroTitle = document.getElementById("heroTitle");
    els.heroCtaLabel = document.getElementById("heroCtaLabel");
    els.pillGroup = document.getElementById("pillGroup");
    els.sidebar = document.getElementById("sidebar");
    els.caseFade = document.getElementById("caseFade");
    els.stageContent = document.getElementById("stageContent");
    els.toast = document.getElementById("toast");
    els.lightbox = document.getElementById("lightbox");
    els.lightboxImg = document.getElementById("lightboxImg");
    els.lightboxClose = document.getElementById("lightboxClose");
  }

  /* ---------------- Hover capability ---------------- */
  function detectHoverMode() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function applyHoverMode() {
    state.hoverMode = detectHoverMode();
    els.pillGroup.classList.toggle("degraded", !state.hoverMode);
    els.sidebar.classList.toggle("degraded", !state.hoverMode);
  }

  /* ---------------- Hero ---------------- */
  var HERO_COPY = {
    title: { en: "What you can deliver with Noumi", zh: "用 Noumi 交付更多" },
    cta: { en: "Deliver with Noumi", zh: "立即体验 Noumi" },
  };

  function renderHero() {
    var title = t(HERO_COPY.title);
    var idx = title.indexOf("Noumi");
    els.heroTitle.innerHTML = "";
    if (idx === -1) {
      els.heroTitle.appendChild(document.createTextNode(title));
    } else {
      var before = title.slice(0, idx + "Noumi".length);
      var after = title.slice(idx + "Noumi".length);
      els.heroTitle.appendChild(document.createTextNode(before));
      els.heroTitle.appendChild(buildHeroOrb());
      els.heroTitle.appendChild(document.createTextNode(after));
    }
    els.heroCtaLabel.textContent = t(HERO_COPY.cta);
  }

  function buildHeroOrb() {
    var wrap = document.createElement("span");
    wrap.className = "nx-ma";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML =
      '<svg class="nx-eyes" viewBox="0 0 50 40" fill="none">' +
      '<g class="blink">' +
      '<ellipse cx="17.5" cy="21" rx="9" ry="12.5" transform="rotate(-9 17.5 21)" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linecap="round"></ellipse>' +
      '<ellipse cx="33.5" cy="19.5" rx="9.5" ry="13" transform="rotate(7 33.5 19.5)" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linecap="round"></ellipse>' +
      '<circle class="pu" cx="19.5" cy="15.5" r="3.7" fill="currentColor"></circle>' +
      '<circle class="pu" cx="36" cy="14" r="3.9" fill="currentColor"></circle>' +
      '<circle class="hl" cx="16.2" cy="19.5" r="1.25" fill="#fff"></circle>' +
      '<circle class="hl" cx="32.1" cy="18" r="1.3" fill="#fff"></circle>' +
      "</g>" +
      "</svg>";
    return wrap;
  }

  /* ---------------- Status box copy ---------------- */
  var STATUS_COPY = {
    done: { en: "DONE", zh: "已完成" },
    completedPrefix: { en: "Completed in ", zh: "用时 " },
  };

  /* ---------------- Pills (primary nav) ---------------- */
  function renderPills() {
    els.pillGroup.innerHTML = "";
    CATEGORIES.forEach(function (cat, i) {
      var pill = document.createElement("button");
      pill.type = "button";
      pill.className = "pill" + (i === state.catIndex ? " active" : "");
      pill.style.setProperty("--pill-icon-color", cat.iconColor || "currentColor");
      pill.innerHTML =
        '<span class="pill-icon">' + cat.icon + "</span><span>" + t(cat.label) + "</span>";
      pill.addEventListener("click", function () {
        if (i === state.catIndex) return;
        state.catIndex = i;
        state.caseIndex = 0;
        setActivePill(i);
        renderSidebar();
        lockStageHeight();
        renderCaseContent(false);
      });
      els.pillGroup.appendChild(pill);
    });
  }

  function setActivePill(index) {
    var pills = els.pillGroup.querySelectorAll(".pill");
    pills.forEach(function (el, i) {
      el.classList.toggle("active", i === index);
    });
  }

  /* ---------------- Sidebar (secondary nav, hover-driven) ---------------- */
  function renderSidebar() {
    var cases = CATEGORIES[state.catIndex].cases;
    els.sidebar.innerHTML = "";
    els.sidebar.setAttribute("role", "listbox");

    var row1 = document.createElement("div");
    row1.className = "sidebar-row sidebar-row-1";
    var row2 = document.createElement("div");
    row2.className = "sidebar-row sidebar-row-2";

    var items = cases.map(function (c, i) {
      var item = document.createElement("div");
      item.className =
        "case-item" +
        (i === state.caseIndex ? " active" : "") +
        (c.isPlaceholder ? " placeholder-item" : "");
      item.tabIndex = 0;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", i === state.caseIndex ? "true" : "false");
      item.dataset.index = String(i);

      var label = t(c.title);
      item.innerHTML =
        "<span>" +
        label +
        "</span>" +
        (c.isPlaceholder
          ? '<span class="placeholder-tag">' +
            (state.lang === "zh" ? "占位" : "Placeholder") +
            "</span>"
          : "");

      bindCaseItemEvents(item, i, cases.length);
      return item;
    });

    // Measure natural widths off-screen, then greedily pack each item into
    // whichever of the two rows currently has the smaller total width, so
    // pills fill both rows tightly instead of just alternating by index.
    var measure = document.createElement("div");
    measure.style.position = "fixed";
    measure.style.visibility = "hidden";
    measure.style.top = "-9999px";
    measure.style.left = "-9999px";
    measure.className = "sidebar-row";
    items.forEach(function (item) {
      measure.appendChild(item);
    });
    document.body.appendChild(measure);

    var widths = items.map(function (item) {
      return item.getBoundingClientRect().width;
    });
    document.body.removeChild(measure);

    var row1Width = 0;
    var row2Width = 0;
    items.forEach(function (item, i) {
      if (row1Width <= row2Width) {
        row1.appendChild(item);
        row1Width += widths[i];
      } else {
        row2.appendChild(item);
        row2Width += widths[i];
      }
    });

    els.sidebar.appendChild(row1);
    els.sidebar.appendChild(row2);
  }

  function bindCaseItemEvents(item, index, total) {
    // Fine-pointer hover: debounce 60ms, and once the pointer leaves the
    // directory entirely we intentionally stay on the last-hovered item
    // (no reset / rebound) per the confirmed spec.
    item.addEventListener("mouseenter", function () {
      if (!state.hoverMode) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () {
        selectCase(index);
      }, HOVER_DEBOUNCE_MS);
    });
    item.addEventListener("mouseleave", function () {
      if (!state.hoverMode) return;
      clearTimeout(hoverTimer);
    });

    // Keyboard: focus acts exactly like hover (immediate, no debounce).
    item.addEventListener("focus", function () {
      selectCase(index);
    });

    item.addEventListener("keydown", function (evt) {
      if (evt.key === "ArrowDown") {
        evt.preventDefault();
        focusItemAt(Math.min(index + 1, total - 1));
      } else if (evt.key === "ArrowUp") {
        evt.preventDefault();
        focusItemAt(Math.max(index - 1, 0));
      }
    });

    // Click always works, in both hover and degraded (touch) modes.
    item.addEventListener("click", function () {
      selectCase(index);
    });
  }

  function focusItemAt(index) {
    var item = els.sidebar.querySelector('.case-item[data-index="' + index + '"]');
    if (item) item.focus();
  }

  function selectCase(index) {
    if (index === state.caseIndex) return;
    state.caseIndex = index;

    var items = els.sidebar.querySelectorAll(".case-item");
    items.forEach(function (el) {
      var i = Number(el.dataset.index);
      el.classList.toggle("active", i === index);
      el.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    renderCaseContent(true);
  }

  /* ---------------- Height lock ----------------
   * Measure the tallest case in the current category off-screen and lock
   * that as min-height on the stage content wrapper, before any switch
   * happens. This prevents the panel from jumping/reflowing on hover.
   */
  function lockStageHeight() {
    var cases = CATEGORIES[state.catIndex].cases;
    var measurer = document.createElement("div");
    measurer.style.position = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.pointerEvents = "none";
    measurer.style.zIndex = "-1";
    measurer.style.top = "0";
    measurer.style.left = "0";
    measurer.style.width = els.stageContent.clientWidth + "px";
    measurer.className = "content";
    document.body.appendChild(measurer);

    var maxHeight = 0;
    cases.forEach(function (c) {
      var wrap = document.createElement("div");
      wrap.className = "case-fade in";
      wrap.appendChild(buildCaseBodyNode(c));
      measurer.innerHTML = "";
      measurer.appendChild(wrap);
      maxHeight = Math.max(maxHeight, measurer.scrollHeight);
    });

    document.body.removeChild(measurer);
    els.caseFade.style.minHeight = maxHeight + "px";
  }

  /* ---------------- Case content rendering ---------------- */
  function buildCaseBodyNode(c) {
    var body = document.createElement("div");
    body.className = "msg-block";
    if (c.type === "A") {
      body.appendChild(buildTemplateA(c));
    } else {
      body.appendChild(buildTemplateB(c));
    }
    return body;
  }

  function buildTemplateA(c) {
    var frag = document.createDocumentFragment();

    var hasSidePanel = !!((c.artifacts && c.artifacts.length) || (c.connectors && c.connectors.length));

    var folderNames = [];
    (c.artifacts || []).forEach(function (folder) {
      if (folder.name && folder.name.en) folderNames.push(folder.name.en);
      if (folder.name && folder.name.zh) folderNames.push(folder.name.zh);
    });

    var userBubble = document.createElement("div");
    userBubble.className = "msg-user" + (hasSidePanel ? " is-full-width" : "");
    userBubble.innerHTML = formatMessageText(t(c.prompt), folderNames);

    var inputStack = document.createDocumentFragment();
    inputStack.appendChild(userBubble);
    if (c.inputAttachments && c.inputAttachments.length) {
      inputStack.appendChild(buildInputAttachments(c.inputAttachments));
    }

    if (hasSidePanel) {
      var twoCol = document.createElement("div");
      twoCol.className = "case-two-col";

      var leftCol = document.createElement("div");
      leftCol.className = "case-left-col";
      leftCol.appendChild(buildArtifactsConnectorsPanel(c));
      twoCol.appendChild(leftCol);

      var rightCol = document.createElement("div");
      rightCol.className = "case-right-col";
      rightCol.appendChild(inputStack);
      twoCol.appendChild(rightCol);

      frag.appendChild(twoCol);
    } else {
      frag.appendChild(inputStack);
    }

    frag.appendChild(buildStatusBox(c, hasSidePanel));

    var aiText = document.createElement("div");
    aiText.className = "ai-text";
    aiText.innerHTML = formatMessageText(t(c.reply), folderNames);
    frag.appendChild(aiText);

    var outAtt = c.outputAttachments || [];
    var outImages = outAtt.filter(function (a) {
      return a.kind === "image";
    });
    var outOther = outAtt.filter(function (a) {
      return a.kind === "file" || a.kind === "link";
    });

    if (outOther.length) frag.appendChild(buildOutputCards(outOther));
    if (outImages.length) frag.appendChild(buildMediaRow(outImages));

    return frag;
  }

  /* ---------------- Artifacts & Connectors panel (optional) ---------------- */
  function buildArtifactsConnectorsPanel(c) {
    var hasArtifacts = c.artifacts && c.artifacts.length;
    var hasConnectors = c.connectors && c.connectors.length;

    var panel = document.createElement("div");
    panel.className = "ac-panel" + (!hasArtifacts && hasConnectors ? " ac-panel-compact" : "");

    if (hasArtifacts) {
      var artifactsWrap = document.createElement("div");
      artifactsWrap.className = "ac-artifacts";
      var title = document.createElement("div");
      title.className = "ac-section-title";
      title.textContent = state.lang === "zh" ? "文件" : "Project Files";
      artifactsWrap.appendChild(title);
      var tree = document.createElement("div");
      tree.className = "ac-tree";
      c.artifacts.forEach(function (folder) {
        tree.appendChild(buildArtifactFolderNode(folder));
      });
      artifactsWrap.appendChild(tree);
      panel.appendChild(artifactsWrap);
    }

    if (hasConnectors) {
      var connWrap = document.createElement("div");
      connWrap.className = "ac-connectors";
      var connTitle = document.createElement("div");
      connTitle.className = "ac-section-title";
      connTitle.textContent = state.lang === "zh" ? "连接器" : "Connectors";
      connWrap.appendChild(connTitle);
      var grid = document.createElement("div");
      grid.className = "ac-connectors-grid";
      c.connectors.forEach(function (conn) {
        var chip = document.createElement("div");
        chip.className = "ac-connector-chip";
        var icon = getConnectorIcon(conn);
        var logoHtml = icon
          ? '<span class="ac-connector-logo ac-connector-logo-img" style="background:' +
            icon.bg +
            '"><img src="' +
            resolveAsset(icon.src) +
            '" alt="" /></span>'
          : '<span class="ac-connector-logo" style="background:' +
            (conn.color || "#6e86a4") +
            '">' +
            (conn.logo || "") +
            "</span>";
        chip.innerHTML =
          logoHtml +
          '<span class="ac-connector-name">' +
          t(conn.name) +
          "</span>";
        grid.appendChild(chip);
      });
      connWrap.appendChild(grid);
      panel.appendChild(connWrap);
    }

    return panel;
  }

  function buildArtifactFolderNode(folder) {
    var wrap = document.createDocumentFragment();
    var folderRow = document.createElement("div");
    folderRow.className = "ac-tree-folder";
    folderRow.innerHTML =
      '<span class="ac-tree-chevron">▾</span><span class="ac-tree-icon">📁</span><span class="ac-tree-name">' + t(folder.name) + "</span>";
    wrap.appendChild(folderRow);

    var children = document.createElement("div");
    children.className = "ac-tree-children";
    (folder.files || []).forEach(function (file) {
      var fileRow = document.createElement("div");
      fileRow.className = "ac-tree-file";
      fileRow.innerHTML =
        '<span class="ac-tree-name">' +
        t(file.name) +
        "</span>" +
        (file.ext ? '<span class="ac-tree-ext">' + file.ext + "</span>" : "");
      children.appendChild(fileRow);
    });
    wrap.appendChild(children);

    var box = document.createElement("div");
    box.appendChild(wrap);
    return box;
  }

  function buildTemplateB(c) {
    var frag = document.createDocumentFragment();

    var userBubble = document.createElement("div");
    userBubble.className = "msg-user";
    userBubble.textContent = t(c.prompt);
    frag.appendChild(userBubble);

    var impactWrap = document.createElement("div");
    impactWrap.className = "impact-wrap";
    var arrow = document.createElement("div");
    arrow.className = "impact-arrow";
    arrow.textContent = state.lang === "zh" ? "➜ 引发影响" : "➜ Triggers impact";
    var cards = document.createElement("div");
    cards.className = "impact-cards";
    c.impacts.forEach(function (imp) {
      var card = document.createElement("div");
      card.className = "impact-card";
      card.innerHTML =
        '<span class="tag">' + t(imp.tag) + '</span><div class="desc">' + t(imp.desc) + "</div>";
      cards.appendChild(card);
    });
    impactWrap.appendChild(arrow);
    impactWrap.appendChild(cards);

    frag.appendChild(impactWrap);
    return frag;
  }

  function buildStatusBox(c, fullWidth) {
    var box = document.createElement("div");
    box.className = "status-box" + (fullWidth ? " is-full-width" : "");

    var left = document.createElement("div");
    left.className = "status-left";

    var check = document.createElement("span");
    check.className = "status-check";
    check.textContent = "✓";

    var label = document.createElement("span");
    label.className = "status-label";
    label.textContent = t(STATUS_COPY.done);

    var duration = document.createElement("span");
    duration.className = "status-duration";
    duration.textContent = t(STATUS_COPY.completedPrefix) + (c.duration || "");

    left.appendChild(check);
    left.appendChild(label);
    left.appendChild(duration);

    var chevron = document.createElement("span");
    chevron.className = "status-chevron";
    chevron.textContent = "⌄";
    chevron.setAttribute("aria-hidden", "true");

    box.appendChild(left);
    box.appendChild(chevron);
    return box;
  }

  function buildMediaRow(mediaList) {
    var list = mediaList || [];
    var wrap = document.createElement("div");
    wrap.className = "media-wrap";

    var row = document.createElement("div");
    row.className = "media-row" + (list.length <= 1 ? " single" : "");
    wrap.appendChild(row);

    var blocks = list.map(function (media) {
      return buildMediaBlock(media);
    });
    blocks.forEach(function (block) {
      row.appendChild(block);
    });

    if (list.length <= 1) return wrap;

    var current = 0;

    function go(delta) {
      current = (current + delta + blocks.length) % blocks.length;
      row.scrollTo({ left: blocks[current].offsetLeft, behavior: "smooth" });
    }

    // Trackpad/touch swipes move the row without going through go(); follow them so
    // the arrows keep stepping from the block the reader actually stopped at.
    var syncFrame = 0;

    function syncCurrent() {
      syncFrame = 0;
      var nearest = 0;
      var nearestDistance = Infinity;
      blocks.forEach(function (block, index) {
        var distance = Math.abs(block.offsetLeft - row.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });
      current = nearest;
    }

    row.addEventListener("scroll", function () {
      if (syncFrame) return;
      syncFrame = requestAnimationFrame(syncCurrent);
    });

    var nav = document.createElement("div");
    nav.className = "media-nav";

    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "media-nav-btn media-nav-prev";
    prevBtn.setAttribute("aria-label", state.lang === "zh" ? "上一张" : "Previous image");
    prevBtn.textContent = "‹";
    prevBtn.addEventListener("click", function (evt) {
      evt.stopPropagation();
      go(-1);
    });

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "media-nav-btn media-nav-next";
    nextBtn.setAttribute("aria-label", state.lang === "zh" ? "下一张" : "Next image");
    nextBtn.textContent = "›";
    nextBtn.addEventListener("click", function (evt) {
      evt.stopPropagation();
      go(1);
    });

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    wrap.appendChild(nav);

    return wrap;
  }

  function buildMediaBlock(media) {
    var block = document.createElement("div");
    block.className = "media-block";
    block.tabIndex = 0;

    var isPlaceholder = !media || !media.src;

    if (isPlaceholder) {
      block.classList.add("is-placeholder");
      var badge = document.createElement("div");
      var inner = document.createElement("div");
      badge.className = "media-placeholder-badge";
      badge.textContent = state.lang === "zh" ? "占位" : "PLACEHOLDER";
      var label = document.createElement("div");
      label.className = "media-placeholder-label";
      label.textContent = media ? t(media.caption) : "";
      inner.appendChild(badge);
      inner.appendChild(document.createElement("br"));
      inner.appendChild(label);
      block.appendChild(inner);
    } else {
      block.classList.add("is-loading");
      var img = document.createElement("img");
      img.alt = media.caption ? t(media.caption) : "";
      img.addEventListener("load", function () {
        block.classList.remove("is-loading");
        var ratio = img.naturalWidth / img.naturalHeight;
        if (ratio >= 2) {
          block.classList.add("is-oversized-wide");
        } else if (ratio <= 0.5) {
          block.classList.add("is-oversized-tall");
        }
      });
      img.addEventListener("error", function () {
        block.classList.remove("is-loading");
      });
      img.src = resolveAsset((media.baseDir || "assets/cases/") + media.src);
      block.appendChild(img);
    }

    var hint = document.createElement("div");
    hint.className = "media-zoom-hint";
    hint.textContent = isPlaceholder
      ? (state.lang === "zh" ? "占位附件" : "Placeholder attachment")
      : (state.lang === "zh" ? "↗ 查看原图" : "↗ View full image");
    block.appendChild(hint);

    function activate() {
      if (isPlaceholder) {
        placeholderToast(media ? t(media.caption) : "");
      } else {
        openLightbox(resolveAsset((media.baseDir || "assets/cases/") + media.src), media.caption ? t(media.caption) : "");
      }
    }
    block.addEventListener("click", activate);
    block.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        activate();
      }
    });

    return block;
  }

  /* ---------------- Attachment cards (input row: image / file / link) ---------------- */
  function placeholderToast(name) {
    showToast(
      state.lang === "zh"
        ? "占位附件：「" + name + "」尚未提供真实文件"
        : 'Placeholder attachment: "' + name + '" has no real file yet.'
    );
  }

  function buildInputAttachments(list) {
    var wrap = document.createElement("div");
    wrap.className = "attachments";
    list.forEach(function (a) {
      if (a.kind === "image") {
        wrap.appendChild(buildInputImageThumb(a));
      } else {
        wrap.appendChild(buildInputFileOrLinkChip(a));
      }
    });
    return wrap;
  }

  function buildInputImageThumb(a) {
    var isPlaceholder = !!a.isPlaceholder || !a.src;
    var name = t(a.name);
    var el = document.createElement("div");
    el.className = "attachment-thumb" + (isPlaceholder ? " is-placeholder" : "");
    el.tabIndex = 0;

    if (isPlaceholder) {
      var ph = document.createElement("span");
      ph.className = "thumb-placeholder";
      el.appendChild(ph);
    } else {
      el.classList.add("is-loading");
      var img = document.createElement("img");
      img.src = resolveAsset("assets/files/" + a.src);
      img.alt = name;
      img.addEventListener("load", function () {
        el.classList.remove("is-loading");
      });
      img.addEventListener("error", function () {
        el.classList.remove("is-loading");
      });
      el.appendChild(img);
    }

    var label = document.createElement("span");
    label.textContent = name;
    el.appendChild(label);

    function activate() {
      if (isPlaceholder) {
        placeholderToast(name);
      } else {
        openLightbox(resolveAsset("assets/files/" + a.src), name);
      }
    }
    el.addEventListener("click", function (evt) {
      evt.preventDefault();
      activate();
    });
    el.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        activate();
      }
    });
    return el;
  }

  function buildInputFileOrLinkChip(a) {
    var isLink = a.kind === "link";
    var isPlaceholder = !!a.isPlaceholder || (isLink ? !a.url : !a.src);
    var name = isLink ? t(a.label) : t(a.name);
    var badge = isLink ? "LINK" : a.ext;

    var el = document.createElement(isPlaceholder ? "div" : "a");
    el.className = "attachment-chip" + (isPlaceholder ? " is-placeholder" : "");
    el.tabIndex = 0;
    el.innerHTML =
      '<span class="' + (isLink ? "link-badge" : "ext") + '">' + badge + "</span><span>" + name + "</span>";

    if (!isPlaceholder) {
      if (isLink) {
        el.href = a.url;
        el.target = "_blank";
        el.rel = "noopener";
      } else {
        el.href = resolveAsset("assets/files/" + a.src);
        el.setAttribute("download", "");
      }
    } else {
      el.addEventListener("click", function () {
        placeholderToast(name);
      });
      el.addEventListener("keydown", function (evt) {
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          placeholderToast(name);
        }
      });
    }
    return el;
  }

  /* ---------------- Output attachment cards (file / link, below AI reply) ---------------- */
  function buildOutputCards(list) {
    var wrap = document.createElement("div");
    wrap.className = "output-cards";
    list.forEach(function (a) {
      wrap.appendChild(buildOutputCard(a));
    });
    return wrap;
  }

  function buildOutputCard(a) {
    var isLink = a.kind === "link";
    var isPlaceholder = !!a.isPlaceholder || (isLink ? !a.url : !a.src);
    var name = isLink ? t(a.label) : t(a.name);
    var badge = isLink ? "LINK" : a.ext;

    var el = document.createElement(isPlaceholder ? "div" : "a");
    el.className =
      "output-card" +
      (isPlaceholder ? " is-placeholder" : "") +
      (isLink && !isPlaceholder ? " is-link" : "") +
      (!isLink && !isPlaceholder ? " is-file" : "");
    el.tabIndex = 0;
    el.innerHTML =
      '<span class="output-card-icon">' +
      badge +
      '</span><span class="output-card-name">' +
      name +
      "</span>" +
      (isLink && !isPlaceholder ? '<span class="output-card-arrow">↗</span>' : "");
    el.title = name;

    if (!isPlaceholder) {
      if (isLink) {
        el.href = a.url;
        el.target = "_blank";
        el.rel = "noopener";
      } else {
        el.href = resolveAsset("assets/files/" + a.src);
        el.setAttribute("download", "");
      }
    } else {
      el.addEventListener("click", function () {
        placeholderToast(name);
      });
      el.addEventListener("keydown", function (evt) {
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          placeholderToast(name);
        }
      });
    }
    return el;
  }

  function renderCaseContent(animate) {
    clearTimeout(caseTimer);
    clearTimeout(hoverTimer);
    var cat = CATEGORIES[state.catIndex];
    var c = cat.cases[state.caseIndex];

    function paint() {
      els.caseFade.innerHTML = "";
      els.caseFade.appendChild(buildCaseBodyNode(c));
    }

    if (!animate) {
      paint();
      els.caseFade.classList.add("in");
      return;
    }

    els.caseFade.classList.remove("in");
    caseTimer = setTimeout(function () {
      paint();
      requestAnimationFrame(function () {
        els.caseFade.classList.add("in");
      });
    }, FADE_MS);
  }

  /* ---------------- Toast ---------------- */
  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2200);
  }

  /* ---------------- Lightbox ---------------- */
  function openLightbox(src, alt) {
    previousFocus = document.activeElement;
    els.lightboxImg.src = src;
    els.lightboxImg.alt = alt || "";
    els.lightbox.classList.add("show");
    els.lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    els.lightboxClose.focus();
  }

  function closeLightbox() {
    els.lightbox.classList.remove("show");
    els.lightbox.setAttribute("aria-hidden", "true");
    els.lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }

  function isLightboxOpen() {
    return els.lightbox.classList.contains("show");
  }

  /* ---------------- Global render ---------------- */
  function renderAll(animateCase) {
    renderHero();
    renderPills();
    renderSidebar();
    lockStageHeight();
    renderCaseContent(animateCase);
  }

  function bindGlobalEvents() {
    var hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    var onHoverChange = function () {
      applyHoverMode();
    };
    if (hoverQuery.addEventListener) {
      hoverQuery.addEventListener("change", onHoverChange);
    } else if (hoverQuery.addListener) {
      hoverQuery.addListener(onHoverChange);
    }

    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        els.caseFade.style.minHeight = "";
        lockStageHeight();
      }, 150);
    });

    els.lightboxClose.addEventListener("click", closeLightbox);
    els.lightbox.addEventListener("click", function (evt) {
      if (evt.target === els.lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape" && isLightboxOpen()) closeLightbox();
      if (evt.key === "Tab" && isLightboxOpen()) {
        evt.preventDefault();
        els.lightboxClose.focus();
      }
    });
  }

  function init() {
    cacheEls();
    document.documentElement.setAttribute("lang", state.lang === "zh" ? "zh-CN" : "en");
    applyHoverMode();
    bindGlobalEvents();
    loadContent()
      .then(function () {
        renderAll(false);
      })
      .catch(function (err) {
        els.caseFade.textContent =
          state.lang === "zh" ? "内容加载失败，请刷新页面重试。" : "Failed to load content — please refresh.";
        console.error(err);
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
