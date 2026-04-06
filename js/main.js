/* ============================================
   対話で学ぶ くるま🚙用語辞典 - Main Script
   JSON駆動のサイトレンダリング
   ============================================ */

(function () {
  'use strict';

  /* ---------- セキュリティ: 右クリック & DevTools 制御 ---------- */
  document.addEventListener('contextmenu', function (e) {
    // 用語名（コピー可能要素）では右クリック許可
    if (e.target.closest('.term-name-copyable')) return;
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

  var SITE_NAME = '対話で学ぶ くるま🚙用語辞典';

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

  /**
   * ひらがな→カタカナ変換
   */
  function hiraganaToKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, function(match) {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
  }

  /**
   * 文字がカタカナで始まるかチェック
   */
  function startsWithKana(reading, kana) {
    var kanaReading = hiraganaToKatakana(reading);
    return kanaReading.startsWith(kana);
  }

  /**
   * 文字がアルファベットで始まるかチェック
   */
  function startsWithAlpha(name, alpha) {
    return name.toUpperCase().startsWith(alpha.toUpperCase());
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
            '<span class="logo-text">' + SITE_NAME + '</span>' +
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
            '<a href="' + basePath + 'index.html#recent">最近の用語</a>' +
            '<a href="' + basePath + 'index.html#index">五十音索引</a>' +
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
            '<a href="' + basePath + 'index.html#index">五十音索引</a>' +
            '<a href="' + basePath + 'index.html#author">このサイトについて</a>' +
          '</div>' +
          '<p class="copyright">&copy; 2026 ' + SITE_NAME + ' All Rights Reserved.</p>' +
        '</div>' +
      '</footer>'
    );
  }

  /* ---------- トップページ ---------- */
  function renderIndexPage() {
    // ローディング表示
    appEl.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div>読み込み中…</div>';

    return loadJSON('data/terms-index.json').then(function (termsIndex) {
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
          '<h1>' + SITE_NAME + '</h1>' +
          '<p>先生と生徒の会話形式で、くるまの用語を「なるほど！」と分かるように解説します</p>' +
        '</section>';

      /* ---- 2カラム ---- */
      html += '<div class="two-col">';

      /* 最近の用語 */
      html +=
        '<section class="section" id="recent">' +
          '<h2 class="section-title">最近登録した用語</h2>' +
          '<div class="term-list">';

      for (var ri = 0; ri < recent.length; ri++) {
        var t = recent[ri];
        html +=
          '<a href="terms/' + t.id + '.html" class="term-item term-item-link">' +
            '<span class="term-date">' + formatDate(t.date) + '</span>' +
            '<div class="term-info">' +
              '<span class="term-name">' + t.name + '</span>' +
              '<p class="term-desc">' + t.oneLiner + '</p>' +
            '</div>' +
          '</a>';
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
          '<a href="terms/' + q.id + '.html" class="term-item term-item-link">' +
            '<span class="term-rank">' + (qi + 1) + '位</span>' +
            '<div class="term-info">' +
              '<span class="term-name">' + q.name + '</span>' +
              '<p class="term-desc">' + q.oneLiner + '</p>' +
            '</div>' +
          '</a>';
      }

      html += '</div></section>';
      html += '</div>'; // two-col

      /* ---- 五十音索引 ---- */
      html +=
        '<section class="section" id="index">' +
          '<h2 class="section-title">五十音索引</h2>' +
          '<div class="index-grid" id="indexGridKana">';

      var kana = 'ア イ ウ エ オ カ キ ク ケ コ サ シ ス セ ソ タ チ ツ テ ト ナ ニ ヌ ネ ノ ハ ヒ フ ヘ ホ マ ミ ム メ モ ヤ ユ ヨ ラ リ ル レ ロ ワ'.split(' ');
      for (var ki = 0; ki < kana.length; ki++) {
        html += '<button type="button" class="index-char" data-char="' + kana[ki] + '" data-type="kana">' + kana[ki] + '</button>';
      }

      html += '</div><div class="index-grid index-alpha" id="indexGridAlpha">';

      var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (var ai = 0; ai < alpha.length; ai++) {
        html += '<button type="button" class="index-char" data-char="' + alpha[ai] + '" data-type="alpha">' + alpha[ai] + '</button>';
      }

      html += '</div>';
      
      /* 五十音索引の結果表示エリア */
      html += '<div class="index-results" id="indexResults"></div>';
      
      html += '</section>';

      /* ---- 作者 ---- */
      html +=
        '<section class="section" id="author">' +
          '<h2 class="section-title">このサイトについて</h2>' +
          '<div class="author-card">' +
            '<div class="author-avatar"><img src="' + IMAGES.admin + '" alt="管理人"></div>' +
            '<div class="author-info">' +
              '<h3>' + SITE_NAME + ' 管理人</h3>' +
              '<p>「くるまの用語って難しい…」そう思ったことはありませんか？<br>' +
              'このサイトでは、くるまに関する用語を<strong>先生と生徒の対話形式</strong>でやさしく解説しています。' +
              '難しい専門用語も、日常の例えを使って「なるほど！」と思えるように工夫しました。<br>' +
              '初心者の方から詳しい方まで、幅広くお役に立てれば嬉しいです。' +
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

      initSearch(termsIndex);
      initIndexInteractions(termsIndex);
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
      loadJSON('data/terms-index.json'),
      loadJSON('data/terms/' + termId + '.json')
    ]).then(function (res) {
      var termsIndex = res[0];
      var term = res[1];

      var html = renderHeader();
      html += '<div class="container">';

      /* パンくず */
      html +=
        '<nav class="breadcrumb">' +
          '<a href="' + basePath + 'index.html">トップ</a>' +
          '<span class="sep">›</span>' +
          '<span>' + term.name + '</span>' +
        '</nav>';

      /* 用語ヘッダー */
      html +=
        '<div class="term-header">' +
          '<h1 class="term-name-copyable" title="クリックでコピー">' + term.name + '</h1>' +
          '<p class="term-reading">読み：' + term.reading;

      if (term.fullName) {
        html += ' ／ 正式名称：<span class="term-name-copyable" title="クリックでコピー">' + term.fullName + '</span>';
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
        var isT = d.speaker === 'teacher' || d.speaker === 'assistant';
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
          '<h2>まとめ</h2>';

      if (Array.isArray(term.summary)) {
        html += '<ul>';
        for (var si = 0; si < term.summary.length; si++) {
          html += '<li>' + escapeHtml(term.summary[si]) + '</li>';
        }
        html += '</ul>';
      } else if (typeof term.summary === 'string') {
        html += '<p style="white-space:pre-line">' + escapeHtml(term.summary) + '</p>';
      }

      html += '</div>';

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
      document.title = term.name + 'とは？ - ' + SITE_NAME;

      initSearch(termsIndex);
      initDialogueAnimation();
      initCopyable();
      initSharedBehaviors();
    }).catch(function (err) {
      appEl.innerHTML = '<div class="loading-screen">データの読み込みに失敗しました。ページを再読み込みしてください。</div>';
      console.error(err);
    });
  }

  /* ---------- 検索 ---------- */
  function initSearch(termsIndex) {
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
  function initIndexInteractions(termsIndex) {
    var resultsContainer = document.getElementById('indexResults');
    var chars = document.querySelectorAll('.index-char');
    
    for (var j = 0; j < chars.length; j++) {
      chars[j].addEventListener('click', function (e) {
        e.preventDefault();
        var c = this.dataset.char;
        var type = this.dataset.type;

        // アクティブ状態管理
        for (var k = 0; k < chars.length; k++) chars[k].classList.remove('active');
        this.classList.add('active');

        // 該当用語をフィルタ
        var matched = [];
        for (var i = 0; i < termsIndex.length; i++) {
          var t = termsIndex[i];
          var isMatch = false;

          if (type === 'kana') {
            // カタカナの場合、読みの頭文字でマッチ
            isMatch = startsWithKana(t.reading, c);
          } else if (type === 'alpha') {
            // アルファベットの場合、name（英字の場合）でマッチ
            isMatch = startsWithAlpha(t.name, c);
          }

          if (isMatch) matched.push(t);
        }

        // 結果表示
        if (matched.length === 0) {
          resultsContainer.innerHTML = '<div class="index-no-results">「' + c + '」で始まる用語はありません</div>';
        } else {
          var html = '<div class="index-results-title">「' + c + '」から始まる用語（' + matched.length + '件）</div><div class="index-results-list">';
          for (var mi = 0; mi < matched.length; mi++) {
            var m = matched[mi];
            html +=
              '<a href="terms/' + m.id + '.html" class="index-result-item">' +
                '<span class="index-result-name">' + m.name + '</span>' +
                '<span class="index-result-desc">' + m.oneLiner + '</span>' +
              '</a>';
          }
          html += '</div>';
          resultsContainer.innerHTML = html;
        }

        resultsContainer.classList.add('active');
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  /* ---------- 用語名コピー機能 ---------- */
  function initCopyable() {
    var copyables = document.querySelectorAll('.term-name-copyable');
    
    for (var i = 0; i < copyables.length; i++) {
      copyables[i].addEventListener('click', function() {
        var text = this.textContent;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function() {
            showCopyToast('コピーしました: ' + text);
          });
        } else {
          // フォールバック
          var textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          showCopyToast('コピーしました: ' + text);
        }
      });
    }
  }

  function showCopyToast(message) {
    var existing = document.querySelector('.copy-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.classList.add('visible');
    }, 10);

    setTimeout(function() {
      toast.classList.remove('visible');
      setTimeout(function() {
        toast.remove();
      }, 300);
    }, 2000);
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
