#!/usr/bin/env node
/**
 * 記事自動生成スクリプト
 * Usage: node scripts/generate-terms.js [all]
 *
 * 7カテゴリ100件の記事を一括生成
 * 例: node scripts/generate-terms.js all → 全件生成
 */

const fs = require('fs');
const path = require('path');

const TERMS_DIR = path.join(__dirname, '..', 'data', 'terms');
const HTML_DIR = path.join(__dirname, '..', 'terms');
const BATCH_SIZE = 100;

// カテゴリ別データを読み込む（7カテゴリ）
const autoParts = require('./data/auto-parts');
const powertrain = require('./data/powertrain');
const manufacturers = require('./data/manufacturers');
const regulations = require('./data/regulations');
const cybersecurity = require('./data/cybersecurity');
const functionalSafety = require('./data/functional-safety');
const diagnostic = require('./data/diagnostic');

// 全用語を結合
const allTerms = [
  ...autoParts,
  ...powertrain,
  ...manufacturers,
  ...regulations,
  ...cybersecurity,
  ...functionalSafety,
  ...diagnostic,
];

console.log(`Total terms defined: ${allTerms.length}`);

// ============================================================
// 対話テンプレート生成関数
// ============================================================

function generateDialogue(term) {
  const templates = {
    'auto-parts': genAutoPartsDialogue,
    'powertrain': genPowertrainDialogue,
    'manufacturer': genManufacturerDialogue,
    'regulation': genRegulationDialogue,
    'cybersecurity': genCybersecurityDialogue,
    'functional-safety': genFunctionalSafetyDialogue,
    'diagnostic': genDiagnosticDialogue,
  };
  const fn = templates[term.category] || genGenericDialogue;
  return fn(term);
}

function genAutoPartsDialogue(t) {
  return [
    { speaker: "student", text: `先生、「<strong>${t.name}</strong>」ってクルマのどこに使われている部品なんですか？` },
    { speaker: "teacher", text: `いい質問だね！<strong>${t.name}</strong>${t.fullName ? '（' + t.fullName + '）' : ''}は、${t.desc}<br><br>たとえるなら、<strong>${t.analogy}</strong>みたいなものだよ。` },
    { speaker: "student", text: `なるほど！じゃあ、もし${t.name}が壊れたり劣化したりしたらどうなるんですか？` },
    { speaker: "teacher", text: `${t.impact || t.name + 'が正常に機能しないと、クルマの性能や安全性に大きく影響する'}んだ。<br><br>だから定期的な点検や整備がとても大切なんだよ。` },
    { speaker: "student", text: `${t.name}って思った以上に重要な部品なんですね！覚えておきます！` }
  ];
}

function genPowertrainDialogue(t) {
  return [
    { speaker: "student", text: `先生、「<strong>${t.name}</strong>」って何ですか？パワートレインに関係あるって聞いたんですけど…` },
    { speaker: "teacher", text: `そうだよ！<strong>${t.name}</strong>${t.fullName ? '（' + t.fullName + '）' : ''}は、${t.desc}<br><br>わかりやすく言うと、<strong>${t.analogy}</strong>ようなイメージだね。` },
    { speaker: "student", text: `へぇ〜！じゃあ、${t.name}はクルマの走りにどう影響するんですか？` },
    { speaker: "teacher", text: `${t.impact || t.name + 'は、クルマの走行性能・燃費・環境性能に直結する重要な技術'}なんだ。<br><br>最近のクルマはどんどん進化していて、${t.name}の技術も日々進歩しているんだよ。` },
    { speaker: "student", text: `${t.name}のおかげでクルマが進化してるんですね！すごいなぁ！` }
  ];
}

function genManufacturerDialogue(t) {
  return [
    { speaker: "student", text: `先生、「<strong>${t.name}</strong>」ってどんな会社なんですか？` },
    { speaker: "teacher", text: `<strong>${t.name}</strong>${t.fullName ? '（' + t.fullName + '）' : ''}は、${t.desc}<br><br>自動車業界では、<strong>${t.analogy}</strong>のような存在なんだ。` },
    { speaker: "student", text: `すごいですね！具体的にはどんな製品やサービスを提供しているんですか？` },
    { speaker: "teacher", text: `${t.impact || t.name + 'は自動車産業において非常に重要な役割を果たしている'}よ。<br><br>世界中の自動車メーカーや部品メーカーと協力して、より良いクルマづくりに貢献しているんだ。` },
    { speaker: "student", text: `${t.name}って自動車業界になくてはならない存在なんですね！` }
  ];
}

function genRegulationDialogue(t) {
  return [
    { speaker: "student", text: `先生、「<strong>${t.name}</strong>」ってどんな法規・規格なんですか？` },
    { speaker: "teacher", text: `<strong>${t.name}</strong>${t.fullName ? '（' + t.fullName + '）' : ''}は、${t.desc}<br><br>たとえるなら、<strong>${t.analogy}</strong>のようなものだよ。` },
    { speaker: "student", text: `なるほど。なぜこの規制・規格が必要なんですか？` },
    { speaker: "teacher", text: `${t.impact || 'この規格があることで、クルマの安全性や環境性能が確保される'}んだ。<br><br>世界中のクルマが一定の基準を満たすことで、私たちの安全と環境が守られているんだよ。` },
    { speaker: "student", text: `法規や規格って、私たちの安全を守るためにとても大切なんですね！` }
  ];
}

function genCybersecurityDialogue(t) {
  return [
    { speaker: "student", text: `先生、「<strong>${t.name}</strong>」ってサイバーセキュリティでどういう意味ですか？` },
    { speaker: "teacher", text: `<strong>${t.name}</strong>${t.fullName ? '（' + t.fullName + '）' : ''}は、${t.desc}<br><br>たとえるなら、<strong>${t.analogy}</strong>みたいなものだね。` },
    { speaker: "student", text: `クルマにもサイバーセキュリティが必要なんですね。具体的にどう使われるんですか？` },
    { speaker: "teacher", text: `${t.impact || '現代のコネクテッドカーは常にネットワークに接続されているから、サイバー攻撃から守る仕組みが不可欠'}なんだ。<br><br>${t.name}は、その防御の重要な一部なんだよ。` },
    { speaker: "student", text: `クルマのセキュリティって奥が深いんですね。${t.name}、しっかり覚えます！` }
  ];
}

function genFunctionalSafetyDialogue(t) {
  return [
    { speaker: "student", text: `先生、「<strong>${t.name}</strong>」って機能安全でどういう意味があるんですか？` },
    { speaker: "teacher", text: `<strong>${t.name}</strong>${t.fullName ? '（' + t.fullName + '）' : ''}は、${t.desc}<br><br>たとえるなら、<strong>${t.analogy}</strong>みたいなものだよ。` },
    { speaker: "student", text: `なるほど。なぜ機能安全でこれが重要なんですか？` },
    { speaker: "teacher", text: `${t.impact || 'この考え方は、クルマの電子制御システムが故障した際に人命を守るための根幹技術'}なんだ。<br><br>クルマの電子化が進む今、E/Eシステムの安全設計は絶対に欠かせないんだよ。` },
    { speaker: "student", text: `機能安全って奥が深いんですね。${t.name}、しっかり覚えます！` }
  ];
}

function genDiagnosticDialogue(t) {
  return [
    { speaker: "student", text: `先生、「<strong>${t.name}</strong>」って診断通信でどういう役割があるんですか？` },
    { speaker: "teacher", text: `<strong>${t.name}</strong>${t.fullName ? '（' + t.fullName + '）' : ''}は、${t.desc}<br><br>たとえるなら、<strong>${t.analogy}</strong>みたいなイメージだね。` },
    { speaker: "student", text: `へぇ！具体的にはどういう場面で使うんですか？` },
    { speaker: "teacher", text: `${t.impact || t.name + 'は、クルマの故障診断やメンテナンスの現場で欠かせない技術'}なんだ。<br><br>整備士がクルマの状態を正確に把握するために、この仕組みが活躍しているんだよ。` },
    { speaker: "student", text: `診断通信って、クルマの「健康診断」みたいなものなんですね！${t.name}、よく分かりました！` }
  ];
}

function genGenericDialogue(t) {
  return [
    { speaker: "student", text: `先生、「<strong>${t.name}</strong>」って何ですか？` },
    { speaker: "teacher", text: `<strong>${t.name}</strong>は、${t.desc}<br><br>イメージとしては、<strong>${t.analogy}</strong>みたいなものだよ。` },
    { speaker: "student", text: `なるほど！もう少し詳しく教えてください！` },
    { speaker: "teacher", text: `${t.impact || t.name + 'は自動車技術において重要な役割を持っている'}んだ。` },
    { speaker: "student", text: `${t.name}、よく分かりました！ありがとうございます！` }
  ];
}

// ============================================================
// サマリー生成
// ============================================================

function generateSummary(term) {
  const s = [];
  if (term.fullName && term.fullName !== term.name) {
    s.push(`<strong>${term.name}</strong>は「${term.fullName}」の略称・通称`);
  } else {
    s.push(`<strong>${term.name}</strong>：${term.oneLiner}`);
  }
  s.push(term.desc.replace(/<[^>]+>/g, '').substring(0, 80));
  if (term.analogy) s.push(`たとえるなら「${term.analogy.replace(/<[^>]+>/g, '')}」`);
  if (term.keyPoints && term.keyPoints.length > 0) {
    for (const kp of term.keyPoints) {
      s.push(kp);
    }
  }
  return s.slice(0, 5);
}

// ============================================================
// JSON / HTML ファイル生成
// ============================================================

function generateTermJSON(term, index) {
  // 日付を通番から生成（2026-01-01から1日ずつ進める）
  const baseDate = new Date('2026-01-01');
  baseDate.setDate(baseDate.getDate() + index);
  const dateStr = term.date || baseDate.toISOString().split('T')[0];

  return {
    id: term.id,
    name: term.name,
    reading: term.reading,
    fullName: term.fullName || '',
    aliases: term.aliases || [],
    oneLiner: term.oneLiner,
    date: dateStr,
    dialogue: generateDialogue(term),
    summary: generateSummary(term),
    relatedTerms: (term.related || []).map(rid => {
      const found = allTerms.find(t => t.id === rid);
      return { name: found ? found.name : rid, id: rid };
    }),
    termLinks: {}
  };
}

function generateTermHTML(term) {
  const title = `${term.name}とは？`;
  const desc = `${term.name}（${term.reading}）を先生と生徒の対話形式でやさしく解説。${term.oneLiner}`;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${title} - 対話で学ぶ くるま🚙用語辞典</title>
  <meta name="description" content="${desc.replace(/"/g, '&quot;')}">
  <meta name="keywords" content="${term.name},${term.reading},用語,解説">
  <meta property="og:title" content="${title} - 対話で学ぶ くるま🚙用語辞典">
  <meta property="og:description" content="${term.name}を対話形式でやさしく解説。初心者でも「なるほど！」と分かります。">
  <meta property="og:type" content="article">
  <link rel="icon" href="../images/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div id="app" data-page="term" data-term-id="${term.id}"></div>
  <script src="../js/main.js"></script>
</body>
</html>`;
}

// ============================================================
// バッチ処理
// ============================================================

function runBatch(batchNum) {
  const start = (batchNum - 1) * BATCH_SIZE;
  const end = Math.min(start + BATCH_SIZE, allTerms.length);

  if (start >= allTerms.length) {
    console.log(`Batch ${batchNum}: 対象なし (全${allTerms.length}件)`);
    return 0;
  }

  const batch = allTerms.slice(start, end);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`バッチ ${batchNum}: 用語 ${start + 1}〜${end} を生成中...`);
  console.log(`${'='.repeat(50)}`);

  // ディレクトリ確認
  if (!fs.existsSync(TERMS_DIR)) fs.mkdirSync(TERMS_DIR, { recursive: true });
  if (!fs.existsSync(HTML_DIR)) fs.mkdirSync(HTML_DIR, { recursive: true });

  let count = 0;
  for (let i = 0; i < batch.length; i++) {
    const term = batch[i];
    const globalIndex = start + i;

    // JSON生成
    const jsonData = generateTermJSON(term, globalIndex);
    const jsonPath = path.join(TERMS_DIR, `${term.id}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    // HTML生成
    const htmlContent = generateTermHTML(term);
    const htmlPath = path.join(HTML_DIR, `${term.id}.html`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

    count++;
  }

  console.log(`✓ ${count}件の用語を生成しました`);
  console.log(`  JSON: ${TERMS_DIR}`);
  console.log(`  HTML: ${HTML_DIR}`);

  // カテゴリ別集計
  const catCount = {};
  for (const t of batch) {
    catCount[t.category] = (catCount[t.category] || 0) + 1;
  }
  console.log(`  カテゴリ別: ${JSON.stringify(catCount)}`);

  return count;
}

// ============================================================
// メイン
// ============================================================

const arg = process.argv[2] || 'all';

if (arg === 'all') {
  const totalBatches = Math.ceil(allTerms.length / BATCH_SIZE);
  let total = 0;
  for (let i = 1; i <= totalBatches; i++) {
    total += runBatch(i);
  }
  console.log(`\n全${total}件の生成が完了しました。`);
} else {
  const batchNum = parseInt(arg);
  if (isNaN(batchNum) || batchNum < 1) {
    console.log('Usage: node scripts/generate-terms.js [batch_number|all]');
    console.log('  batch_number: 1〜' + Math.ceil(allTerms.length / BATCH_SIZE));
    process.exit(1);
  }
  runBatch(batchNum);
}
