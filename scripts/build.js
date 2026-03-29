/**
 * 対話で学ぶ くるま🚙用語辞典 - ビルドスクリプト
 * 
 * 機能：
 * 1. data/terms/ 内の全JSONから terms-index.json を自動生成
 * 2. 対話文中の既存用語に自動でリンクを付与（termLinks生成）
 * 
 * 使い方：node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

// パス設定
const TERMS_DIR = path.join(__dirname, '..', 'data', 'terms');
const INDEX_PATH = path.join(__dirname, '..', 'data', 'terms-index.json');

/**
 * 全用語JSONファイルを読み込む
 */
function loadAllTerms() {
  const files = fs.readdirSync(TERMS_DIR).filter(f => f.endsWith('.json'));
  const terms = [];

  for (const file of files) {
    try {
      const filePath = path.join(TERMS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const term = JSON.parse(content);
      terms.push({ ...term, _fileName: file });
    } catch (err) {
      console.error(`⚠ ${file} の読み込みエラー:`, err.message);
    }
  }

  return terms;
}

/**
 * 用語名とIDのマッピングを作成（自動リンク用）
 */
function buildTermNameMap(terms) {
  const map = {};
  
  for (const term of terms) {
    // メイン用語名
    map[term.name] = term.id;
    
    // 別名（aliases）
    if (term.aliases && Array.isArray(term.aliases)) {
      for (const alias of term.aliases) {
        if (alias && !map[alias]) {
          map[alias] = term.id;
        }
      }
    }
  }

  return map;
}

/**
 * 対話文中の用語にリンクを自動付与
 * termLinksオブジェクトを生成して各用語JSONに書き戻す
 */
function generateTermLinks(terms, termNameMap) {
  let updated = 0;

  for (const term of terms) {
    const termLinks = {};
    const selfId = term.id;
    
    if (!term.dialogue || !Array.isArray(term.dialogue)) continue;

    // 対話文の全テキストを連結
    const allText = term.dialogue.map(d => d.text).join(' ');

    // 他の用語が含まれているかチェック
    for (const [name, targetId] of Object.entries(termNameMap)) {
      // 自分自身へのリンクは除外
      if (targetId === selfId) continue;
      
      // テキスト内に用語が存在するかチェック
      if (allText.includes(name)) {
        termLinks[name] = targetId;
      }
    }

    // termLinksが変更されていれば更新
    const oldLinks = JSON.stringify(term.termLinks || {});
    const newLinks = JSON.stringify(termLinks);
    
    if (oldLinks !== newLinks) {
      term.termLinks = termLinks;
      
      // ファイルに書き戻す
      const filePath = path.join(TERMS_DIR, term._fileName);
      const { _fileName, ...termData } = term;
      fs.writeFileSync(filePath, JSON.stringify(termData, null, 2), 'utf-8');
      console.log(`✓ ${term.name} のtermLinksを更新`);
      updated++;
    }
  }

  return updated;
}

/**
 * terms-index.json を生成
 */
function generateTermsIndex(terms) {
  const index = terms.map(term => ({
    id: term.id,
    name: term.name,
    reading: term.reading,
    fullName: term.fullName || '',
    aliases: term.aliases || [],
    oneLiner: term.oneLiner,
    date: term.date
  }));

  // 日付の降順でソート
  index.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`✓ terms-index.json を生成（${index.length}件）`);
}

/**
 * メイン処理
 */
function build() {
  console.log('='.repeat(50));
  console.log('対話で学ぶ くるま🚙用語辞典 - ビルド開始');
  console.log('='.repeat(50));

  // 1. 全用語読み込み
  console.log('\n[1/3] 用語データ読み込み中...');
  const terms = loadAllTerms();
  console.log(`    ${terms.length}件の用語を読み込みました`);

  // 2. 用語名マップ作成 & termLinks自動生成
  console.log('\n[2/3] 対話文中の用語リンクを自動生成中...');
  const termNameMap = buildTermNameMap(terms);
  const updatedCount = generateTermLinks(terms, termNameMap);
  console.log(`    ${updatedCount}件のtermLinksを更新しました`);

  // 3. terms-index.json 生成
  console.log('\n[3/3] terms-index.json を生成中...');
  generateTermsIndex(terms);

  console.log('\n' + '='.repeat(50));
  console.log('ビルド完了！');
  console.log('='.repeat(50));
}

// 実行
build();
