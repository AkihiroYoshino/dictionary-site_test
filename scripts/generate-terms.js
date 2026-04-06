/**
 * 対話で学ぶ くるま🚙用語辞典 - 用語自動生成スクリプト v2
 * 10メッセージ（5往復）のOEMエンジニア向け対話を生成
 * speaker: 'teacher'=先生（assistant）, 'student'=生徒（user）
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

// ----- 対話生成（12メッセージ / 6往復）-----
// 各先生の返答は2文以内に抑え、自然な口語で会話を展開する

function generateDialogue(term) {
  const cat = term.category;
  const gen = dialogueGenerators[cat] || dialogueGenerators._default;
  return gen(term);
}

const dialogueGenerators = {

  'auto-parts': (t) => [
    { speaker: 'student', text: t.name + 'って、クルマのどこに使われてるの？' },
    { speaker: 'teacher', text: t.name + 'は「' + t.oneLiner + '」だよ。イメージ的には「' + t.analogy + '」に近い感じかな。' },
    { speaker: 'student', text: 'なるほど！どういう仕組みで動いてるの？' },
    { speaker: 'teacher', text: _fs(t.desc) },
    { speaker: 'student', text: 'もう少し詳しく教えて。' },
    { speaker: 'teacher', text: _rs(t.desc) || '設計面では材質・強度・重量バランスが特に重要で、品質は直接走行性能に影響するんだ。' },
    { speaker: 'student', text: 'OEMの開発現場ではどういう扱いなの？' },
    { speaker: 'teacher', text: _fs(t.impact) },
    { speaker: 'student', text: 'EVや電動化が進んでも関係ある部品なの？' },
    { speaker: 'teacher', text: '電動化でも廃止にはならないよ。むしろ軽量化・高精度化の要求が増して、設計難易度が上がるケースが多いんだ。' },
    { speaker: 'student', text: '整理すると、どのポイントを押さえておけばいい？' },
    { speaker: 'teacher', text: '①' + t.oneLiner + '②' + _short(t.desc) + '③' + _short(t.impact) + '——この三点が基本だよ。' },
  ],

  'powertrain': (t) => [
    { speaker: 'student', text: t.name + 'ってパワートレインの中でどういう役割をしてるの？' },
    { speaker: 'teacher', text: t.name + 'は「' + t.oneLiner + '」んだよ。たとえると「' + t.analogy + '」みたいな感じかな。' },
    { speaker: 'student', text: '具体的な仕組みを教えて！' },
    { speaker: 'teacher', text: _fs(t.desc) },
    { speaker: 'student', text: 'それで実際、エンジンやモーターとどう連携してるの？' },
    { speaker: 'teacher', text: _rs(t.desc) || 'エネルギー変換効率を最大化するため、ECUとの緻密な協調制御が設計の核心になるんだ。' },
    { speaker: 'student', text: 'OEMやサプライヤーはどう対応してるの？' },
    { speaker: 'teacher', text: _fs(t.impact) },
    { speaker: 'student', text: 'カーボンニュートラルの流れで変わってきてる？' },
    { speaker: 'teacher', text: 'HEV・BEV・FCEVなど電動化の方向性によって設計思想が変わるよ。' + t.name + 'も形を変えながら生き残っている技術だね。' },
    { speaker: 'student', text: 'まとめると何が大事？' },
    { speaker: 'teacher', text: '①' + t.oneLiner + '②' + _short(t.desc) + '③' + _short(t.impact) + '——パワートレイン設計の基盤としてしっかり押さえよう。' },
  ],

  'manufacturer': (t) => [
    { speaker: 'student', text: t.name + 'ってどんなグループなの？' },
    { speaker: 'teacher', text: t.name + 'は「' + t.oneLiner + '」だよ。ひとことで言えば「' + t.analogy + '」的な存在かな。' },
    { speaker: 'student', text: 'グループの規模や構成は？' },
    { speaker: 'teacher', text: _fs(t.desc) },
    { speaker: 'student', text: 'どんな技術的な強みがあるの？' },
    { speaker: 'teacher', text: _rs(t.desc) || 'グループ全体で技術を標準化・共有することで、開発効率と品質を高Water levelているんだよ。' },
    { speaker: 'student', text: 'OEM視点での特徴は？' },
    { speaker: 'teacher', text: _fs(t.impact) },
    { speaker: 'student', text: 'サプライチェーン面では？' },
    { speaker: 'teacher', text: '内製化率が高く、コア部品のグループ内調達で品質管理とコスト競争力を両立させているのが大きな特徴だよ。' },
    { speaker: 'student', text: 'ポイントをまとめて！' },
    { speaker: 'teacher', text: '①' + t.oneLiner + '②' + _short(t.desc) + '③' + _short(t.impact) + '——技術DNAを理解するとグループ戦略が見えてくるよ。' },
  ],

  'regulation': (t) => [
    { speaker: 'student', text: t.name + 'って何の規制なの？' },
    { speaker: 'teacher', text: t.name + 'は「' + t.oneLiner + '」だよ。ルールブックに例えると「' + t.analogy + '」みたいな位置づけかな。' },
    { speaker: 'student', text: '具体的に何を規定してるの？' },
    { speaker: 'teacher', text: _fs(t.desc) },
    { speaker: 'student', text: 'もう少し詳しく！要件の中身は？' },
    { speaker: 'teacher', text: _rs(t.desc) || '適合性を証明するには、文書・試験・審査の三段構えで認可当局に示す必要があるんだ。' },
    { speaker: 'student', text: 'OEMの開発スケジュールにはどう影響するの？' },
    { speaker: 'teacher', text: _fs(t.impact) },
    { speaker: 'student', text: '対応できなかったらどうなるの？' },
    { speaker: 'teacher', text: '型式認可が下りないと新車を市場に出せないよ。規制発効の数年前から対応計画を立てることが必須なんだ。' },
    { speaker: 'student', text: 'エンジニアとして最低限押さえるポイントは？' },
    { speaker: 'teacher', text: '①' + t.oneLiner + '②' + _short(t.desc) + '③' + _short(t.impact) + '——法規動向は車両開発日程に直結するので常にウォッチしよう。' },
  ],

  'cybersecurity': (t) => [
    { speaker: 'student', text: t.name + 'って車のセキュリティでどんな意味があるの？' },
    { speaker: 'teacher', text: t.name + 'は「' + t.oneLiner + '」だよ。たとえると「' + t.analogy + '」のような役割かな。' },
    { speaker: 'student', text: '仕組みをもう少し教えて！' },
    { speaker: 'teacher', text: _fs(t.desc) },
    { speaker: 'student', text: '技術的にはどう実装されてるの？' },
    { speaker: 'teacher', text: _rs(t.desc) || 'ハードウェアとソフトウェアを組み合わせた多層防御が基本で、単一の対策だけでは不十分なんだ。' },
    { speaker: 'student', text: 'UN R155やISO/SAE 21434とはどう関係するの？' },
    { speaker: 'teacher', text: _fs(t.impact) },
    { speaker: 'student', text: '実際の攻撃を受けたらどうなるの？' },
    { speaker: 'teacher', text: '攻撃が成功すると車両制御への不正介入やデータ漏洩につながるよ。だから' + t.name + 'は多層防御の重要な1層を担っているんだ。' },
    { speaker: 'student', text: 'CSMS構築で最重要なポイントは？' },
    { speaker: 'teacher', text: '①' + t.oneLiner + '②' + _short(t.desc) + '③' + _short(t.impact) + '——TARA・ペネトレテストとセットで理解しよう。' },
  ],

  'functional-safety': (t) => [
    { speaker: 'student', text: t.name + 'って機能安全でどんな意味があるの？' },
    { speaker: 'teacher', text: t.name + 'は「' + t.oneLiner + '」だよ。わかりやすく言えば「' + t.analogy + '」みたいなイメージかな。' },
    { speaker: 'student', text: 'ISO 26262の中でどう位置づけられてるの？' },
    { speaker: 'teacher', text: _fs(t.desc) },
    { speaker: 'student', text: 'もう少し詳しく教えて！' },
    { speaker: 'teacher', text: _rs(t.desc) || 'ASIL判定と安全要件の割り当てがセットで行われるため、開発の上流工程での分析精度が特に重要なんだ。' },
    { speaker: 'student', text: '具体的に開発現場ではどう使われるの？' },
    { speaker: 'teacher', text: _fs(t.impact) },
    { speaker: 'student', text: 'ADAS・自動運転でのニーズはどう変わってる？' },
    { speaker: 'teacher', text: 'ADAS/ADの高度化でASIL-C/D要件が増えており、SOTIFやサイバーセキュリティとの複合対応が求められているよ。安全分析がより複雑になっているんだ。' },
    { speaker: 'student', text: 'エンジニアとして押さえるポイントは？' },
    { speaker: 'teacher', text: '①' + t.oneLiner + '②' + _short(t.desc) + '③' + _short(t.impact) + '——安全設計の基盤として確実に理解しておこう。' },
  ],

  'diagnostic': (t) => [
    { speaker: 'student', text: t.name + 'ってUDSのどのサービスなの？' },
    { speaker: 'teacher', text: t.name + 'は「' + t.oneLiner + '」だよ。たとえると「' + t.analogy + '」のような役割かな。' },
    { speaker: 'student', text: 'プロトコルの仕様を教えて！' },
    { speaker: 'teacher', text: _fs(t.desc) },
    { speaker: 'student', text: 'リクエスト/レスポンスの具体的な形式は？' },
    { speaker: 'teacher', text: _rs(t.desc) || 'NRC（Negative Response Code）で正常/異常を判別し、エラー要因を特定できるように設計されているんだよ。' },
    { speaker: 'student', text: '量産開発やディーラー診断でどう使うの？' },
    { speaker: 'teacher', text: _fs(t.impact) },
    { speaker: 'student', text: 'セキュリティ観点での注意点はある？' },
    { speaker: 'teacher', text: '診断通信はUN R155のアタックサーフェスになり得るよ。SecurityAccess(0x27)の強度やProgrammingSessionのアクセス制御がTARAの重要チェックポイントなんだ。' },
    { speaker: 'student', text: 'まとめるとどのポイントが大事？' },
    { speaker: 'teacher', text: '①' + t.oneLiner + '②' + _short(t.desc) + '③' + _short(t.impact) + '——UDS理解は車両診断・リプロ・OTAの基盤だよ。' },
  ],

  _default: (t) => [
    { speaker: 'student', text: t.name + 'って何？' },
    { speaker: 'teacher', text: t.name + 'は「' + t.oneLiner + '」だよ。イメージとしては「' + t.analogy + '」に近い感じかな。' },
    { speaker: 'student', text: 'もう少し詳しく教えて！' },
    { speaker: 'teacher', text: _fs(t.desc) },
    { speaker: 'student', text: '続きは？' },
    { speaker: 'teacher', text: _rs(t.desc) || '設計とルールの両面から理解することが大切だよ。' },
    { speaker: 'student', text: '開発現場への影響は？' },
    { speaker: 'teacher', text: _fs(t.impact) },
    { speaker: 'student', text: '今後の動向はどうなるの？' },
    { speaker: 'teacher', text: 'この分野は技術と法規の両方が進化しているので、継続的なキャッチアップが必要だよ。' },
    { speaker: 'student', text: 'まとめて！' },
    { speaker: 'teacher', text: '①' + t.oneLiner + '②' + _short(t.desc) + '③' + _short(t.impact) },
  ],
};

/** 先頭の一文（句点まで）を取り出す */
function _fs(s) {
  if (!s) return '';
  const m = s.match(/^(.{15,}?[。！？])/);
  return m ? m[1] : (s.length > 100 ? s.substring(0, 90) + '…' : s);
}

/** 先頭の一文を除いた残りを返す（短すぎる場合は空文字） */
function _rs(s) {
  if (!s) return '';
  const m = s.match(/^.{15,}?[。！？]([\s\S]*)/);
  const rest = m ? m[1].trim() : '';
  return rest.length > 15 ? rest : '';
}

function _short(s) {
  if (!s) return '';
  return s.length > 60 ? s.substring(0, 55) + '…' : s;
}

// ----- サマリー生成 -----

function generateSummary(term) {
  return [
    '【定義】' + term.name + 'は「' + term.oneLiner + '」',
    '【技術】' + _short2(term.desc),
    '【OEM視点】' + _short2(term.impact),
  ];
}

function _short2(s) {
  if (!s) return '';
  return s.length > 120 ? s.substring(0, 110) + '…' : s;
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
  const outPath = path.join(TERMS_DIR, term.id + '.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  return outPath;
}

function writeTermHTML(term) {
  const html = '<!DOCTYPE html>\n' +
    '<html lang="ja">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>' + term.name + ' - 対話で学ぶ くるま🚙用語辞典</title>\n' +
    '  <meta name="description" content="' + term.oneLiner + '">\n' +
    '  <link rel="stylesheet" href="../css/style.css">\n' +
    '</head>\n' +
    '<body>\n' +
    '  <div id="app" data-page="term" data-term-id="' + term.id + '"></div>\n' +
    '  <script src="../js/main.js"><\/script>\n' +
    '</body>\n' +
    '</html>';
  const outPath = path.join(HTML_DIR, term.id + '.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  return outPath;
}

// ----- メイン -----

function generateCategory(catKey) {
  const loader = dataSources[catKey];
  if (!loader) { console.error('カテゴリ不明: ' + catKey); return []; }
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
  [TERMS_DIR, HTML_DIR].forEach(function(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  let total = 0;
  if (arg === 'all') {
    for (const cat of Object.keys(dataSources)) {
      const ids = generateCategory(cat);
      console.log('[' + (CATS[cat] ? CATS[cat].label : cat) + '] ' + ids.length + '件 生成');
      total += ids.length;
    }
  } else {
    const ids = generateCategory(arg);
    console.log('[' + (CATS[arg] ? CATS[arg].label : arg) + '] ' + ids.length + '件 生成');
    total = ids.length;
  }
  console.log('\n合計 ' + total + '件の用語を生成しました。');
}

run();
