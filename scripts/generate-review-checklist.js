/**
 * レビューチェックリストExcel生成モジュール
 *
 * build.js から呼び出して、data/terms/ の全記事をもとに
 * docs/review-checklist.xlsx を生成・更新する。
 *
 * 単体実行: node scripts/generate-review-checklist.js
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const TERMS_DIR = path.join(__dirname, '..', 'data', 'terms');
const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'review-checklist.xlsx');

// カテゴリの日本語名マッピング
const CATEGORY_LABELS = {
  'auto-parts':        '自動車部品',
  'powertrain':        'パワートレイン',
  'manufacturer':      '自動車関連メーカー',
  'regulation':        '法規・規格',
  'cybersecurity':     'サイバーセキュリティ',
  'functional-safety': '機能安全',
  'diagnostic':        '診断通信',
};

/**
 * data/terms/ 配下の全JSONを読み込む
 */
function loadAllTerms() {
  const files = fs.readdirSync(TERMS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(TERMS_DIR, f), 'utf-8');
    return JSON.parse(raw);
  });
}

/**
 * カテゴリ推定（JSONにcategoryがない場合、ファイル名やrelatedTermsから推定する簡易版）
 */
function guessCategory(term) {
  if (term.category) return term.category;
  const id = term.id || '';
  if (id.startsWith('sid-') || id === 'uds' || id === 'negative-response') return 'diagnostic';
  if (id.startsWith('un-r') || ['wp29','type-approval','1958-agreement','gtr','wltp'].includes(id)) return 'regulation';
  if (['csms','sums','defense-in-depth','tara','iso-sae-21434','secure-boot','secure-ota','ids-ips','vehicle-soc','secoc','hsm','pki','vlan-separation','penetration-testing','fuzz-testing'].includes(id)) return 'cybersecurity';
  if (['iso-26262','asil','severity','exposure','controllability','asil-decomposition','safety-goal','hara','fmea','fta','safety-case','freedom-from-interference','sotif'].includes(id)) return 'functional-safety';
  return 'other';
}

/**
 * Excel生成メイン処理
 */
async function generateReviewChecklist() {
  const terms = loadAllTerms();
  terms.sort((a, b) => {
    const catA = guessCategory(a);
    const catB = guessCategory(b);
    if (catA !== catB) return catA.localeCompare(catB);
    return (a.name || '').localeCompare(b.name || '');
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = '対話で学ぶ くるま🚙用語辞典 - 自動生成';
  workbook.created = new Date();

  // ========== Sheet 1: レビューチェックリスト ==========
  const ws = workbook.addWorksheet('レビューチェックリスト', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'No.',        key: 'no',        width: 6 },
    { header: 'ID',         key: 'id',        width: 24 },
    { header: '用語名',     key: 'name',      width: 32 },
    { header: 'カテゴリ',   key: 'category',  width: 18 },
    { header: '読み',       key: 'reading',    width: 20 },
    { header: '正式名称',   key: 'fullName',  width: 44 },
    { header: '日付',       key: 'date',      width: 14 },
    { header: '①内容の正確性',     key: 'chk1', width: 16 },
    { header: '②たとえ話の妥当性', key: 'chk2', width: 18 },
    { header: '③対話の自然さ',     key: 'chk3', width: 16 },
    { header: '④まとめの適切さ',   key: 'chk4', width: 18 },
    { header: '⑤関連用語の正確性', key: 'chk5', width: 18 },
    { header: '⑥HTML/JSON整合性',  key: 'chk6', width: 18 },
    { header: '判定',       key: 'result',    width: 10 },
    { header: '指摘事項・コメント', key: 'comment', width: 50 },
  ];

  // ヘッダースタイル
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 36;

  // データ行
  terms.forEach((term, i) => {
    const cat = guessCategory(term);
    const row = ws.addRow({
      no: i + 1,
      id: term.id,
      name: (term.name || '').replace(/<[^>]+>/g, ''),
      category: CATEGORY_LABELS[cat] || cat,
      reading: term.reading || '',
      fullName: term.fullName || '',
      date: term.date || '',
      chk1: '',
      chk2: '',
      chk3: '',
      chk4: '',
      chk5: '',
      chk6: '',
      result: '',
      comment: '',
    });
    row.alignment = { vertical: 'middle', wrapText: true };

    // チェック列にドロップダウン（OK/NG/—）
    for (const col of ['chk1','chk2','chk3','chk4','chk5','chk6']) {
      row.getCell(col).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"OK,NG,—"'],
      };
    }
    // 判定列
    row.getCell('result').dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"合格,要修正,未レビュー"'],
    };

    // 交互色
    if (i % 2 === 1) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
    }
  });

  // 罫線
  ws.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // オートフィルター
  ws.autoFilter = { from: 'A1', to: `O${terms.length + 1}` };

  // ========== Sheet 2: カテゴリ別集計 ==========
  const ws2 = workbook.addWorksheet('カテゴリ別集計');
  ws2.columns = [
    { header: 'カテゴリ',   key: 'cat',   width: 24 },
    { header: '記事数',     key: 'count', width: 10 },
    { header: 'レビュー済', key: 'done',  width: 14 },
    { header: '合格',       key: 'pass',  width: 10 },
    { header: '要修正',     key: 'fix',   width: 10 },
  ];
  const h2 = ws2.getRow(1);
  h2.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  h2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };

  const catCounts = {};
  for (const t of terms) {
    const c = CATEGORY_LABELS[guessCategory(t)] || 'その他';
    catCounts[c] = (catCounts[c] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(catCounts).sort()) {
    ws2.addRow({ cat, count, done: 0, pass: 0, fix: 0 });
  }
  ws2.addRow({ cat: '合計', count: terms.length, done: 0, pass: 0, fix: 0 });

  // 出力
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  await workbook.xlsx.writeFile(OUTPUT_PATH);
  console.log(`✓ レビューチェックリスト生成: ${OUTPUT_PATH} (${terms.length}件)`);
  return terms.length;
}

module.exports = { generateReviewChecklist };

// 直接実行時
if (require.main === module) {
  generateReviewChecklist().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
