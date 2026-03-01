/* ============================================
   なるほどIT用語辞典 - JavaScript
   ============================================ */

// --- 用語データベース ---
const termsDB = [
  {
    name: "API",
    reading: "エーピーアイ",
    desc: "ソフトウェア同士が会話するための「窓口」のこと。レストランの注文カウンターのようなもの。",
    category: "Web技術",
    url: "terms/api.html",
    date: "2026/03/01"
  },
  {
    name: "Cookie（クッキー）",
    reading: "クッキー",
    desc: "Webサイトがブラウザに預ける小さなメモ。あなたが誰かを覚えておくための仕組み。",
    category: "Web技術",
    url: "terms/cookie.html",
    date: "2026/02/28"
  },
  {
    name: "ファイアウォール",
    reading: "ファイアウォール",
    desc: "ネットワークの「門番」。外部からの不正アクセスをブロックするセキュリティの仕組み。",
    category: "セキュリティ",
    url: "terms/firewall.html",
    date: "2026/02/26"
  },
  {
    name: "SQL",
    reading: "エスキューエル",
    desc: "データベースに「これちょうだい」「これ追加して」とお願いするための言葉（言語）。",
    category: "データベース",
    url: "terms/sql.html",
    date: "2026/02/24"
  },
  {
    name: "Docker",
    reading: "ドッカー",
    desc: "アプリを動かすための環境を「コンテナ」にまとめて、どこでも同じように動かせる技術。",
    category: "クラウド",
    url: "terms/docker.html",
    date: "2026/02/22"
  },
  {
    name: "HTML",
    reading: "エイチティーエムエル",
    desc: "Webページの「骨格」を作るための言語。見出し・段落・画像などページの構造を定義する。",
    category: "Web技術",
    url: "#",
    date: "2026/02/20"
  },
  {
    name: "CSS",
    reading: "シーエスエス",
    desc: "Webページの「見た目」を整えるための言語。色・レイアウト・フォントなどデザインを担当。",
    category: "Web技術",
    url: "#",
    date: "2026/02/18"
  },
  {
    name: "JavaScript",
    reading: "ジャバスクリプト",
    desc: "Webページに「動き」を加えるプログラミング言語。ボタンクリックやアニメーションなど。",
    category: "プログラミング",
    url: "#",
    date: "2026/02/16"
  },
  {
    name: "IPアドレス",
    reading: "アイピーアドレス",
    desc: "インターネット上の住所。ネットワークに繋がる全ての機器に割り振られた識別番号。",
    category: "ネットワーク",
    url: "#",
    date: "2026/02/14"
  },
  {
    name: "DNS",
    reading: "ディーエヌエス",
    desc: "ドメイン名（google.comなど）をIPアドレスに変換する「電話帳」のような仕組み。",
    category: "ネットワーク",
    url: "#",
    date: "2026/02/12"
  },
  {
    name: "クラウド",
    reading: "クラウド",
    desc: "インターネットを通じてサーバーやデータベースなどのITリソースを利用する仕組み。",
    category: "クラウド",
    url: "#",
    date: "2026/02/10"
  },
  {
    name: "プロキシ",
    reading: "プロキシ",
    desc: "ユーザーの代わりにインターネットにアクセスする「代理人」のようなサーバー。",
    category: "ネットワーク",
    url: "#",
    date: "2026/02/08"
  },
  {
    name: "VPN",
    reading: "ブイピーエヌ",
    desc: "インターネット上に「専用のトンネル」を作って、安全に通信する仕組み。",
    category: "セキュリティ",
    url: "#",
    date: "2026/02/06"
  },
  {
    name: "Git",
    reading: "ギット",
    desc: "ファイルの変更履歴を記録・管理するバージョン管理システム。タイムマシンのようなもの。",
    category: "プログラミング",
    url: "#",
    date: "2026/02/04"
  },
  {
    name: "機械学習",
    reading: "きかいがくしゅう",
    desc: "コンピュータがデータから自動的にパターンやルールを学ぶ仕組み。AIの中核技術。",
    category: "AI・機械学習",
    url: "#",
    date: "2026/02/02"
  }
];

// --- パスの解決 ---
function resolveURL(url) {
  // 用語ページから呼ばれた場合、パスを調整
  const isTermPage = window.location.pathname.includes('/terms/');
  if (isTermPage && !url.startsWith('../') && !url.startsWith('http')) {
    if (url.startsWith('terms/')) {
      return url.replace('terms/', '');
    }
    return '../' + url;
  }
  return url;
}

// --- 検索機能 ---
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchBtn = document.getElementById('searchBtn');

  if (!searchInput || !searchResults) return;

  // インクリメンタル検索
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query.length === 0) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    const results = termsDB.filter(term =>
      term.name.toLowerCase().includes(query) ||
      term.reading.toLowerCase().includes(query) ||
      term.desc.toLowerCase().includes(query) ||
      term.category.toLowerCase().includes(query)
    );

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">😅 該当する用語が見つかりませんでした</div>';
    } else {
      searchResults.innerHTML = results.map(term => `
        <a href="${resolveURL(term.url)}" class="search-result-item">
          <div class="sr-name">${highlightMatch(term.name, query)}</div>
          <div class="sr-desc">${term.desc}</div>
        </a>
      `).join('');
    }

    searchResults.classList.add('active');
  });

  // 検索ボタン
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchInput.dispatchEvent(new Event('input'));
      searchInput.focus();
    });
  }

  // Enterキー
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstResult = searchResults.querySelector('.search-result-item');
      if (firstResult) {
        window.location.href = firstResult.getAttribute('href');
      }
    }
  });

  // 外側クリックで閉じる
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-search')) {
      searchResults.classList.remove('active');
    }
  });

  // フォーカスで再表示
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
      searchResults.classList.add('active');
    }
  });
});

// --- 検索ハイライト ---
function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<strong style="color:var(--accent);">$1</strong>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- カテゴリカードクリック ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const category = card.dataset.category;
      const categoryName = card.querySelector('.cat-name').textContent;

      // 検索フィールドにカテゴリ名を入れて検索
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = categoryName;
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();

        // スクロール
        document.querySelector('.header-search').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });
});

// --- 五十音索引ハイライト ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.index-grid a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const char = link.textContent.trim();

      // 検索フィールドに入力
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = char;
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();

        document.querySelector('.header-search').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      // アクティブ状態
      document.querySelectorAll('.index-grid a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    });
  });
});

// --- スムーズスクロール（ページ内リンク） ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// --- ヘッダー スクロール効果 ---
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    } else {
      header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
    }

    lastScroll = currentScroll;
  });
});

// --- 対話アニメーション ---
document.addEventListener('DOMContentLoaded', () => {
  const dialogueRows = document.querySelectorAll('.dialogue-row');
  if (dialogueRows.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  dialogueRows.forEach(row => {
    row.style.opacity = '0';
    row.style.transform = 'translateY(20px)';
    row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(row);
  });
});

// --- トップに戻るボタン（動的生成） ---
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.textContent = '↑';
  btn.setAttribute('aria-label', 'トップに戻る');
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    fontSize: '1.3rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    opacity: '0',
    transition: 'opacity 0.3s, transform 0.3s',
    transform: 'translateY(20px)',
    zIndex: '999'
  });

  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(20px)';
    }
  });
});
