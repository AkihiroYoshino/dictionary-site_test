/**
 * 対話で学ぶ くるま🚙用語辞典 - 用語自動生成スクリプト v2
 * 10メッセージ（5往復）のOEMエンジニア向け対話を生成
 *
 * 使い方: node scripts/generate-terms.js all
 */

const fs = require('fs');
const path = require('path');
const { CATS } = require('./data/term-factory');

// データファイル読み込み
const dataSources = {
  'auto-parts':        () => require('./data/auto-parts'),
  'powertrain':        () => require('./data/powertrain'),
  'manufacturer':      () => require('./data/manufacturers'),
  'regulation':        () => require('./data/regulations'),
  'cybersecurity':     () => require('./data/cybersecurity'),
  'functional-safety': () => require('./data/functional-safety'),
  'diagnostic':        () => require('./data/diagnostic'),
};

const TERMS_DIR   = path.join(__dirname, '..', 'data', 'terms');
const HTML_DIR    = path.join(__dirname, '..', 'terms');

// ----- 対話生成（10メッセージ） -----

function generateDialogue(term) {
  const cat = term.category;
  const gen = dialogueGenerators[cat] || dialogueGenerators._default;
  return gen(term);
}

const dialogueGenerators = {

  'auto-parts': (t) => [
    { speaker: 'user',      text: `${t.name}って何？自動車のどこに使われてるの？` },
    { speaker: 'assistant', text: `${t.name}（${t.fullName}）は、${t.oneLiner} 身近なたとえで言うと「${t.analogy}」のようなものだよ。` },
    { speaker: 'user',      text: `なるほど。もう少し技術的に教えて。どんな種類や構造があるの？` },
    { speaker: 'assistant', text: `${t.desc}` },
    { speaker: 'user',      text: `OEMの開発現場ではどういう位置づけなの？` },
    { speaker: 'assistant', text: `${t.impact}` },
    { speaker: 'user',      text: `EV化や電動化で、この部品はどう変わっていくの？` },
    { speaker: 'assistant', text: `電動化の流れで${t.name}にも変革が求められているよ。軽量化・高効率化・システム統合が大きなトレンドで、従来のICE前提の設計からEV/HEV最適設計への移行が進んでいるんだ。` },
    { speaker: 'user',      text: `まとめると、${t.name}のポイントは？` },
    { speaker: 'assistant', text: `まとめるとこうだよ：\n・基本：${t.oneLiner}\n・技術：${_short(t.desc)}\n・OEM視点：${_short(t.impact)}\n開発者として押さえておくべき重要部品だね。` },
  ],

  'powertrain': (t) => [
    { speaker: 'user',      text: `${t.name}（${t.fullName}）って何？パワートレイン全体のどこに位置するの？` },
    { speaker: 'assistant', text: `${t.name}は、${t.oneLiner} たとえると「${t.analogy}」だね。` },
    { speaker: 'user',      text: `動作原理や仕組みをもう少し詳しく知りたい。` },
    { speaker: 'assistant', text: `${t.desc}` },
    { speaker: 'user',      text: `OEMやサプライヤーではどう扱われてるの？` },
    { speaker: 'assistant', text: `${t.impact}` },
    { speaker: 'user',      text: `電動化やカーボンニュートラルの文脈だとどう変わる？` },
    { speaker: 'assistant', text: `電動化の中で${t.name}は形を変えながらも重要性を維持しているよ。HEV→BEV→FCEVの各パワートレイン構成で、技術の組み合わせ方が変わるんだ。` },
    { speaker: 'user',      text: `エンジニアとして覚えておくべきポイントは？` },
    { speaker: 'assistant', text: `要点をまとめるよ：\n・定義：${t.oneLiner}\n・技術ポイント：${_short(t.desc)}\n・業界動向：${_short(t.impact)}\nパワートレイン設計の基礎として押さえておこう。` },
  ],

  'manufacturer': (t) => [
    { speaker: 'user',      text: `${t.name}ってどんなグループ？` },
    { speaker: 'assistant', text: `${t.name}は、${t.oneLiner} 言い換えると「${t.analogy}」だね。` },
    { speaker: 'user',      text: `グループの構成はどうなっているの？` },
    { speaker: 'assistant', text: `${t.desc}` },
    { speaker: 'user',      text: `技術的な特徴や強みは？` },
    { speaker: 'assistant', text: `${t.impact}` },
    { speaker: 'user',      text: `サプライチェーンの観点で特筆すべきことは？` },
    { speaker: 'assistant', text: `${t.name}はグループ内でのサプライチェーン垂直統合が大きな特徴だよ。キー部品の内製率が高く、品質管理と原価低減を同時に実現する体制を構築しているんだ。` },
    { speaker: 'user',      text: `まとめると？` },
    { speaker: 'assistant', text: `まとめ：\n・概要：${t.oneLiner}\n・構成：${_short(t.desc)}\n・技術の強み：${_short(t.impact)}\nOEMエンジニアとしてグループの技術DNA理解は重要だよ。` },
  ],

  'regulation': (t) => [
    { speaker: 'user',      text: `${t.name}って何？どんな規制・規格なの？` },
    { speaker: 'assistant', text: `${t.name}（${t.fullName}）は、${t.oneLiner} たとえると「${t.analogy}」だよ。` },
    { speaker: 'user',      text: `具体的な内容や要件を教えて。` },
    { speaker: 'assistant', text: `${t.desc}` },
    { speaker: 'user',      text: `OEMの開発にはどう影響するの？` },
    { speaker: 'assistant', text: `${t.impact}` },
    { speaker: 'user',      text: `対応しないとどうなるの？時間軸は？` },
    { speaker: 'assistant', text: `法規は型式認可や市場投入の前提条件なので、対応しないと新車を販売できないよ。計画的な対応と認可当局との事前調整が重要だね。` },
    { speaker: 'user',      text: `エンジニアとしてのポイントを整理して。` },
    { speaker: 'assistant', text: `ポイント整理：\n・概要：${t.oneLiner}\n・要件：${_short(t.desc)}\n・OEM影響：${_short(t.impact)}\n法規動向は車両開発日程に直結するので常にウォッチしよう。` },
  ],

  'cybersecurity': (t) => [
    { speaker: 'user',      text: `${t.name}って何？車のサイバーセキュリティでどう重要なの？` },
    { speaker: 'assistant', text: `${t.name}（${t.fullName}）は、${t.oneLiner} たとえると「${t.analogy}」だよ。` },
    { speaker: 'user',      text: `もう少し技術的に詳しく教えて。仕組みや構成は？` },
    { speaker: 'assistant', text: `${t.desc}` },
    { speaker: 'user',      text: `UN R155やISO/SAE 21434との関係は？` },
    { speaker: 'assistant', text: `${t.impact}` },
    { speaker: 'user',      text: `実際の攻撃シナリオだとどう機能するの？` },
    { speaker: 'assistant', text: `実際のサイバー攻撃では、${t.name}は防御チェーンの重要な一環を担うよ。多層防御（Defense in Depth）の考え方でシステム全体の耐性を高めることが大切なんだ。` },
    { speaker: 'user',      text: `要点をまとめて。` },
    { speaker: 'assistant', text: `まとめ：\n・定義：${t.oneLiner}\n・技術：${_short(t.desc)}\n・規制関連：${_short(t.impact)}\nCSMS構築のピースとして理解しておこう。` },
  ],

  'functional-safety': (t) => [
    { speaker: 'user',      text: `${t.name}って何？機能安全でどういう役割？` },
    { speaker: 'assistant', text: `${t.name}（${t.fullName}）は、${t.oneLiner} たとえると「${t.analogy}」だよ。` },
    { speaker: 'user',      text: `ISO 26262での位置づけをもう少し詳しく教えて。` },
    { speaker: 'assistant', text: `${t.desc}` },
    { speaker: 'user',      text: `具体的にOEMの開発ではどう使われるの？` },
    { speaker: 'assistant', text: `${t.impact}` },
    { speaker: 'user',      text: `ADAS/自動運転が進む中での重要度はどう変わる？` },
    { speaker: 'assistant', text: `ADAS/ADの高度化に伴い${t.name}の重要性はますます高まっているよ。ASIL-C/D要件の増加、SOTIFとの複合対応、サイバーセキュリティとの統合管理など、安全分析の複雑度が上がっているんだ。` },
    { speaker: 'user',      text: `エンジニアとして押さえるポイントは？` },
    { speaker: 'assistant', text: `要点：\n・定義：${t.oneLiner}\n・ISO 26262での位置づけ：${_short(t.desc)}\n・開発現場：${_short(t.impact)}\n安全設計の基盤として確実に理解しておこう。` },
  ],

  'diagnostic': (t) => [
    { speaker: 'user',      text: `${t.name}って何？UDSのどこに位置するの？` },
    { speaker: 'assistant', text: `${t.name}（${t.fullName}）は、${t.oneLiner} たとえると「${t.analogy}」だよ。` },
    { speaker: 'user',      text: `プロトコルの詳細を教えて。どんなパラメータがあるの？` },
    { speaker: 'assistant', text: `${t.desc}` },
    { speaker: 'user',      text: `OEMの量産開発やディーラー診断でどう使うの？` },
    { speaker: 'assistant', text: `${t.impact}` },
    { speaker: 'user',      text: `セキュリティや安全性の観点で注意点は？` },
    { speaker: 'assistant', text: `診断通信はセキュリティの観点でUN R155のアタックサーフェスになり得るよ。特にSecurityAccess(0x27)の強度やProgrammingSessionへのアクセス制御がTARAで重点的に分析されるポイントだね。` },
    { speaker: 'user',      text: `ポイントをまとめて。` },
    { speaker: 'assistant', text: `まとめ：\n・定義：${t.oneLiner}\n・プロトコル：${_short(t.desc)}\n・実務：${_short(t.impact)}\nUDS理解は車両診断・リプロ・OTAの基盤だね。` },
  ],

  _default: (t) => [
    { speaker: 'user',      text: `${t.name}って何？` },
    { speaker: 'assistant', text: `${t.name}は、${t.oneLiner} たとえると「${t.analogy}」だよ。` },
    { speaker: 'user',      text: `詳しく教えて。` },
    { speaker: 'assistant', text: `${t.desc}` },
    { speaker: 'user',      text: `開発現場での影響は？` },
    { speaker: 'assistant', text: `${t.impact}` },
    { speaker: 'user',      text: `今後の動向は？` },
    { speaker: 'assistant', text: `今後もこの分野は変化が続くので、最新動向のキャッチアップが重要だよ。` },
    { speaker: 'user',      text: `まとめて。` },
    { speaker: 'assistant', text: `要点：\n・${t.oneLiner}\n・${_short(t.desc)}\n・${_short(t.impact)}` },
  ],
};

function _short(s) {
  if (!s) return '';
  return s.length > 80 ? s.substring(0, 80) + '…' : s;
}

// ----- サマリー生成 -----

function generateSummary(term) {
  return `${term.name}（${term.fullName}）は、${term.oneLiner}\n\n` +
    `■ 技術解説\n${term.desc}\n\n` +
    `■ 業界・OEM視点\n${term.impact}`;
}

// ----- JSON/HTML 出力 -----

function writeTermJSON(term, dialogue, summary) {
  const today = new Date().toISOString().slice(0, 10);
  const data = {
    id: term.id,
    name: term.name,
    reading: term.reading,
    fullName: term.fullName,
    aliases: term.aliases || [],
    oneLiner: term.oneLiner,
    category: term.category,
    dialogue,
    summary,
    termLinks: {},
    date: today,
  };
  const outPath = path.join(TERMS_DIR, `${term.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  return outPath;
}

function writeTermHTML(term) {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${term.name} - 対話で学ぶ くるま🚙用語辞典</title>
  <meta name="description" content="${term.oneLiner}">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div id="app"></div>
  <script src="../js/main.js"><\/script>
</body>
</html>`;
  const outPath = path.join(HTML_DIR, `${term.id}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  return outPath;
}

// ----- メイン -----

function generateCategory(catKey) {
  const loader = dataSources[catKey];
  if (!loader) { console.error(`カテゴリ不明: ${catKey}`); return []; }
  const terms = loader();
  const results = [];
  for (const t of terms) {
    const dialogue = generateDialogue(t);
    const summary = generateSummary(t);
    writeTermJSON(t, dialogue, summary);
    writeTermHTML(t);
    results.push(t.id);
  }
  return results;
}

function run() {
  const arg = process.argv[2] || 'all';

  // ディレクトリ確保
  [TERMS_DIR, HTML_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  let total = 0;
  if (arg === 'all') {
    for (const cat of Object.keys(dataSources)) {
      const ids = generateCategory(cat);
      console.log(`[${CATS[cat]?.label || cat}] ${ids.length}件 生成`);
      total += ids.length;
    }
  } else {
    const ids = generateCategory(arg);
    console.log(`[${CATS[arg]?.label || arg}] ${ids.length}件 生成`);
    total = ids.length;
  }
  console.log(`\n合計 ${total}件の用語を生成しました。`);
}

run();
