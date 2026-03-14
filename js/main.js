/* ============================================
   なるほどIT用語辞典 - Main Script
   JSON駆動のサイトレンダリング
   ============================================ */

(function () {
  'use strict';

  /* ---------- セキュリティ: 右クリック & DevTools 制御 ---------- */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  document.addEventListener('keydown', function (e) {
    var blocked = false;
    // Ctrl+U  (ソース表示)
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'u' || e.key === 'U')) blocked = true;
    // Ctrl+S  (保存)
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 's' || e.key === 'S')) blocked = true;
    // F12
    if (e.key === 'F12') blocked = true;
    // Ctrl+Shift+I / J / C  (DevTools)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      if (['I', 'i', 'J', 'j', 'C', 'c'].indexOf(e.key) !== -1) blocked = true;
    }
    if (blocked) e.preventDefault();
  });

  /* ---------- ページ判定 & パス解決 ---------- */
  var appEl = document.getElementById('app');
  if (!appEl) return;

  var pageType = appEl.dataset.page;
  var termId = appEl.dataset.termId || null;
  var basePath = (pageType === 'term') ? '../' : '';

  var IMAGES = {
    teacher: basePath + 'images/teacher.svg',
    student: basePath + 'images/student.svg',
    admin:   basePath + 'images/admin.svg',
    logo:    basePath + 'images/logo.svg'
  };

  /* ---------- ユーティリティ ---------- */
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    var safe = escapeHtml(text);
    var re = new RegExp('(' + escapeRegex(query) + ')', 'gi');
    return safe.replace(re, '<mark>$1</mark>');
  }

  function processTermLinks(html, termLinks, selfId) {
    if (!termLinks) return html;
    var keys = Object.keys(termLinks);
    for (var i = 0; i < keys.length; i++) {
      var display = keys[i];
      var target = termLinks[display];
      if (!target || target === selfId) continue;
      var re = new RegExp(escapeRegex(display), 'g');
      var linked = false;
      html = html.replace(re, function (m) {
        if (linked) return m;
        linked = true;
        return '<a href="' + target + '.html" class="term-inline-link">' + m + '</a>';
      });
    }
    return html;
  }

  function formatDate(d) {
    return d.replace(/-/g, '/');
  }

  /* ---------- データ読み込み ---------- */
  function loadJSON(path) {
    return fetch(basePath + path).then(function (r) {
      if (!r.ok) throw new Error('Load failed: ' + path);
      return r.json();
    });
  }

  /* ---------- 共通パーツ ---------- */
  function renderHeader() {
    return (
      '<header class="site-header">' +
        '<div class="header-inner">' +
          '<a href="' + basePath + 'index.html" class="site-logo">' +
            '<img src="' + IMAGES.logo + '" alt="" class="logo-icon">' +
            '<span class="logo-text">なるほどIT用語辞典<span class="logo-sub">会話でわかるIT用語</span></span>' +
          '</a>' +
          '<div class="header-search">' +
            '<div class="search-box">' +
              '<input type="text" id="searchInput" placeholder="用語を検索…" autocomplete="off">' +
              '<button type="button" id="searchBtn" aria-label="検索">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
              '</button>' +
            '</div>' +
            '<div class="search-results-dropdown" id="searchResults"></div>' +
          '</div>' +
          '<button class="nav-toggle" id="navToggle" aria-label="メニュー"><span></span><span></span><span></span></button>' +
          '<nav class="header-nav" id="headerNav">' +
            '<a href="' + basePath + 'index.html">トップ</a>' +
            '<a href="' + basePath + 'index.html#categories">カテゴリ</a>' +
            '<a href="' + basePath + 'index.html#recent">最近の用語</a>' +
            '<a href="' + basePath + 'index.html#author">このサイトについて</a>' +
          '</nav>' +
        '</div>' +
      '</header>'
    );
  }

  function renderFooter() {
    return (
      '<footer class="site-footer">' +
        '<div class="footer-inner">' +
          '<div class="footer-links">' +
            '<a href="' + basePath + 'index.html">トップページ</a>' +
            '<a href="' + basePath + 'index.html#categories">カテゴリ一覧</a>' +
            '<a href="' + basePath + 'index.html#index">五十音索引</a>' +
            '<a href="' + basePath + 'index.html#author">このサイトについて</a>' +
          '</div>' +
          '<p class="copyright">&copy; 2026 なるほどIT用語辞典 All Rights Reserved.</p>' +
        '</div>' +
      '</footer>'
    );
  }

  /* ---------- トップページ ---------- */
  function renderIndexPage() {
    // ローディング表示
    appEl.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div>読み込み中…</div>';

    return Promise.all([
      loadJSON('data/config.json'),
      loadJSON('data/terms-index.json')
    ]).then(function (res) {
      var config = res[0];
      var termsIndex = res[1];
      var categories = config.categories;

      // 日付順ソート
      var sorted = termsIndex.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      var recent = sorted.slice(0, 5);

      var html = renderHeader();
      html += '<div class="container">';

      /* ---- Hero ---- */
      html +=
        '<section class="hero">' +
          '<div class="hero-characters">' +
            '<img src="' + IMAGES.student + '" alt="生徒" class="hero-char">' +
            '<span class="hero-speech-bubble">なるほど！</span>' +
            '<img src="' + IMAGES.teacher + '" alt="先生" class="hero-char">' +
          '</div>' +
          '<h1>なるほどIT用語辞典</h1>' +
          '<p>先生と生徒の会話形式で、IT用語を「なるほど！」と分かるように解説します</p>' +
        '</section>';

      /* ---- カテゴリ ---- */
      html +=
        '<section class="section" id="categories">' +
          '<h2 class="section-title">カテゴリから探す</h2>' +
          '<div class="category-grid">';

      for (var ci = 0; ci < categories.length; ci++) {
        var cat = categories[ci];
        var count = 0;
        for (var ti = 0; ti < termsIndex.length; ti++) {
          if (termsIndex[ti].categories.indexOf(cat.id) !== -1) count++;
        }
        html +=
          '<a href="#" class="category-card" data-category="' + cat.id + '" data-category-name="' + cat.name + '">' +
            '<span class="cat-icon" style="background:' + cat.color + '">' + cat.initial + '</span>' +
            '<span class="cat-name">' + cat.name + '</span>' +
            '<span class="cat-count">' + count + ' 用語</span>' +
          '</a>';
      }

      html += '</div></section>';

      /* ---- 2カラム ---- */
      html += '<div class="two-col">';

      /* 最近の用語 */
      html +=
        '<section class="section" id="recent">' +
          '<h2 class="section-title">最近登録した用語</h2>' +
          '<div class="term-list">';

      for (var ri = 0; ri < recent.length; ri++) {
        var t = recent[ri];
        var catLabels = '';
        for (var k = 0; k < t.categories.length; k++) {
          var found = null;
          for (var j = 0; j < categories.length; j++) {
            if (categories[j].id === t.categories[k]) { found = categories[j]; break; }
          }
          catLabels += '<span class="term-tag">' + (found ? found.name : t.categories[k]) + '</span> ';
        }
        html +=
          '<div class="term-item">' +
            '<span class="term-date">' + formatDate(t.date) + '</span>' +
            '<div class="term-info">' +
              '<a href="terms/' + t.id + '.html" class="term-name">' + t.name + '</a>' +
              '<p class="term-desc">' + t.oneLiner + '</p>' +
              catLabels +
            '</div>' +
          '</div>';
      }

      html += '</div></section>';

      /* ランキング */
      html +=
        '<section class="section">' +
          '<h2 class="section-title">アクセスランキング</h2>' +
          '<div class="term-list">';

      for (var qi = 0; qi < recent.length; qi++) {
        var q = recent[qi];
        html +=
          '<div class="term-item">' +
            '<span class="term-rank">' + (qi + 1) + '位</span>' +
            '<div class="term-info">' +
              '<a href="terms/' + q.id + '.html" class="term-name">' + q.name + '</a>' +
              '<p class="term-desc">' + q.oneLiner + '</p>' +
            '</div>' +
          '</div>';
      }

      html += '</div></section>';
      html += '</div>'; // two-col

      /* ---- 五十音索引 ---- */
      html +=
        '<section class="section" id="index">' +
          '<h2 class="section-title">五十音索引</h2>' +
          '<div class="index-grid">';

      var kana = 'ア イ ウ エ オ カ キ ク ケ コ サ シ ス セ ソ タ チ ツ テ ト ナ ニ ヌ ネ ノ ハ ヒ フ ヘ ホ マ ミ ム メ モ ヤ ユ ヨ ラ リ ル レ ロ ワ'.split(' ');
      for (var ki = 0; ki < kana.length; ki++) {
        html += '<a href="#" class="index-char">' + kana[ki] + '</a>';
      }

      html += '</div><div class="index-grid index-alpha">';

      var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (var ai = 0; ai < alpha.length; ai++) {
        html += '<a href="#" class="index-char">' + alpha[ai] + '</a>';
      }

      html += '</div></section>';

      /* ---- 作者 ---- */
      html +=
        '<section class="section" id="author">' +
          '<h2 class="section-title">このサイトについて</h2>' +
          '<div class="author-card">' +
            '<div class="author-avatar"><img src="' + IMAGES.admin + '" alt="管理人"></div>' +
            '<div class="author-info">' +
              '<h3>なるほどIT用語辞典 管理人</h3>' +
              '<p>「IT用語って難しい…」そう思ったことはありませんか？<br>' +
              'このサイトでは、IT用語を<strong>先生と生徒の対話形式</strong>でやさしく解説しています。' +
              '難しい専門用語も、日常の例えを使って「なるほど！」と思えるように工夫しました。<br>' +
              'IT初心者の方からエンジニアの方まで、幅広くお役に立てれば嬉しいです。' +
              '掲載用語は随時追加中。リクエストも大歓迎です！</p>' +
              '<div class="author-links">' +
                '<a href="#">お問い合わせ</a>' +
                '<a href="#">Twitter / X</a>' +
                '<a href="#">ブログ</a>' +
                '<a href="#">用語リクエスト</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</section>';

      html += '</div>'; // container
      html += renderFooter();

      appEl.innerHTML = html;

      initSearch(termsIndex, categories);
      initIndexInteractions();
      initSharedBehaviors();
    }).catch(function (err) {
      appEl.innerHTML = '<div class="loading-screen">データの読み込みに失敗しました。ページを再読み込みしてください。</div>';
      console.error(err);
    });
  }

  /* ---------- 用語ページ ---------- */
  function renderTermPage() {
    appEl.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div>読み込み中…</div>';

    return Promise.all([
      loadJSON('data/config.json'),
      loadJSON('data/terms-index.json'),
      loadJSON('data/terms/' + termId + '.json')
    ]).then(function (res) {
      var config = res[0];
      var termsIndex = res[1];
      var term = res[2];
      var categories = config.categories;

      // カテゴリ名解決
      var catNames = [];
      for (var i = 0; i < term.categories.length; i++) {
        var found = null;
        for (var j = 0; j < categories.length; j++) {
          if (categories[j].id === term.categories[i]) { found = categories[j]; break; }
        }
        catNames.push(found ? found.name : term.categories[i]);
      }

      var html = renderHeader();
      html += '<div class="container">';

      /* パンくず */
      html +=
        '<nav class="breadcrumb">' +
          '<a href="' + basePath + 'index.html">トップ</a>' +
          '<span class="sep">›</span>';

      for (var ci = 0; ci < catNames.length; ci++) {
        if (ci > 0) html += '<span class="sep">,</span> ';
        html += '<a href="' + basePath + 'index.html#categories">' + catNames[ci] + '</a>';
      }

      html +=
          '<span class="sep">›</span>' +
          '<span>' + term.name + '</span>' +
        '</nav>';

      /* 用語ヘッダー */
      html +=
        '<div class="term-header">' +
          '<h1>' + term.name + '</h1>' +
          '<p class="term-reading">読み：' + term.reading;

      if (term.fullName) {
        html += ' ／ 正式名称：' + term.fullName;
      }
      if (term.aliases && term.aliases.length > 0) {
        html += ' ／ 別名：' + term.aliases.join('、');
      }

      html +=
          '</p>' +
          '<p class="term-oneliner">' + term.oneLiner + '</p>' +
        '</div>';

      /* 対話 */
      html +=
        '<div class="dialogue-section">' +
          '<h2>対話で理解しよう</h2>' +
          '<div class="dialogue">';

      for (var di = 0; di < term.dialogue.length; di++) {
        var d = term.dialogue[di];
        var isT = d.speaker === 'teacher';
        var cls = isT ? 'teacher' : 'student';
        var avatar = isT ? IMAGES.teacher : IMAGES.student;
        var name = isT ? '先生' : '生徒';
        var text = processTermLinks(d.text, term.termLinks, term.id);

        html +=
          '<div class="dialogue-row ' + cls + '">' +
            '<div class="dialogue-speaker">' +
              '<img src="' + avatar + '" alt="' + name + '" class="dialogue-avatar">' +
              '<span class="dialogue-name">' + name + '</span>' +
            '</div>' +
            '<div class="dialogue-bubble">' + text + '</div>' +
          '</div>';
      }

      html += '</div></div>';

      /* まとめ */
      html +=
        '<div class="summary-box">' +
          '<h2>まとめ</h2>' +
          '<ul>';

      for (var si = 0; si < term.summary.length; si++) {
        html += '<li>' + term.summary[si] + '</li>';
      }

      html += '</ul></div>';

      /* 関連用語 */
      if (term.relatedTerms && term.relatedTerms.length > 0) {
        html +=
          '<div class="related-terms">' +
            '<h2>関連用語</h2>' +
            '<div class="related-tags">';

        for (var rti = 0; rti < term.relatedTerms.length; rti++) {
          var rt = term.relatedTerms[rti];
          if (rt.id) {
            html += '<a href="' + rt.id + '.html">' + rt.name + '</a>';
          } else {
            html += '<span class="related-tag-disabled">' + rt.name + '</span>';
          }
        }

        html += '</div></div>';
      }

      html += '</div>'; // container
      html += renderFooter();

      appEl.innerHTML = html;

      // タイトル更新
      document.title = term.name + 'とは？ - なるほどIT用語辞典';

      initSearch(termsIndex, categories);
      initDialogueAnimation();
      initSharedBehaviors();
    }).catch(function (err) {
      appEl.innerHTML = '<div class="loading-screen">データの読み込みに失敗しました。ページを再読み込みしてください。</div>';
      console.error(err);
    });
  }

  /* ---------- 検索 ---------- */
  function initSearch(termsIndex, categories) {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var btn = document.getElementById('searchBtn');
    if (!input || !results) return;

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();

      if (q.length === 0) {
        results.classList.remove('active');
        results.innerHTML = '';
        return;
      }

      var matched = [];
      for (var i = 0; i < termsIndex.length; i++) {
        var t = termsIndex[i];
        var hit = false;

        // 名前・読み・正式名称・別名
        if (t.name.toLowerCase().indexOf(q) !== -1) hit = true;
        if (!hit && t.reading.toLowerCase().indexOf(q) !== -1) hit = true;
        if (!hit && t.fullName && t.fullName.toLowerCase().indexOf(q) !== -1) hit = true;
        if (!hit && t.aliases) {
          for (var ai = 0; ai < t.aliases.length; ai++) {
            if (t.aliases[ai].toLowerCase().indexOf(q) !== -1) { hit = true; break; }
          }
        }
        // 一言まとめ
        if (!hit && t.oneLiner.toLowerCase().indexOf(q) !== -1) hit = true;
        // カテゴリ名
        if (!hit) {
          for (var ci = 0; ci < t.categories.length; ci++) {
            for (var cj = 0; cj < categories.length; cj++) {
              if (categories[cj].id === t.categories[ci] &&
                  categories[cj].name.toLowerCase().indexOf(q) !== -1) {
                hit = true;
                break;
              }
            }
            if (hit) break;
          }
        }

        if (hit) matched.push(t);
      }

      if (matched.length === 0) {
        results.innerHTML = '<div class="no-results">該当する用語が見つかりませんでした</div>';
      } else {
        var html = '';
        for (var mi = 0; mi < matched.length; mi++) {
          var m = matched[mi];
          html +=
            '<a href="' + basePath + 'terms/' + m.id + '.html" class="search-result-item">' +
              '<div class="sr-name">' + highlightMatch(m.name, q) + '</div>' +
              '<div class="sr-desc">' + escapeHtml(m.oneLiner) + '</div>' +
            '</a>';
        }
        results.innerHTML = html;
      }

      results.classList.add('active');
    });

    if (btn) {
      btn.addEventListener('click', function () {
        input.dispatchEvent(new Event('input'));
        input.focus();
      });
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = results.querySelector('.search-result-item');
        if (first) window.location.href = first.getAttribute('href');
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.header-search')) {
        results.classList.remove('active');
      }
    });

    input.addEventListener('focus', function () {
      if (input.value.trim().length > 0) {
        results.classList.add('active');
      }
    });
  }

  /* ---------- インデックスページの操作 ---------- */
  function initIndexInteractions() {
    // カテゴリカード
    var cards = document.querySelectorAll('.category-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function (e) {
        e.preventDefault();
        var name = this.dataset.categoryName;
        var input = document.getElementById('searchInput');
        if (input) {
          input.value = name;
          input.dispatchEvent(new Event('input'));
          input.focus();
          var search = document.querySelector('.header-search');
          if (search) search.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    // 五十音
    var chars = document.querySelectorAll('.index-char');
    for (var j = 0; j < chars.length; j++) {
      chars[j].addEventListener('click', function (e) {
        e.preventDefault();
        var c = this.textContent.trim();
        var input = document.getElementById('searchInput');
        if (input) {
          input.value = c;
          input.dispatchEvent(new Event('input'));
          input.focus();
          var search = document.querySelector('.header-search');
          if (search) search.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        for (var k = 0; k < chars.length; k++) chars[k].classList.remove('active');
        this.classList.add('active');
      });
    }
  }

  /* ---------- 対話アニメーション ---------- */
  function initDialogueAnimation() {
    var rows = document.querySelectorAll('.dialogue-row');
    if (rows.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    for (var i = 0; i < rows.length; i++) {
      rows[i].style.transitionDelay = (i * 0.08) + 's';
      observer.observe(rows[i]);
    }
  }

  /* ---------- 共通UI ---------- */
  function initSharedBehaviors() {
    // ナビトグル (モバイル)
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('headerNav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
        toggle.classList.toggle('open');
      });
    }

    // ヘッダースクロール
    var header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        if (window.pageYOffset > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }

    // スムーズスクロール
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // トップに戻る
    var topBtn = document.createElement('button');
    topBtn.id = 'backToTop';
    topBtn.setAttribute('aria-label', 'トップに戻る');
    topBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(topBtn);

    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 400) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
    });
  }

  /* ---------- 初期化 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (pageType === 'index') {
      renderIndexPage();
    } else if (pageType === 'term' && termId) {
      renderTermPage();
    }
  });

})();
