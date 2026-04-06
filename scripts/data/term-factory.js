/**
 * 用語ファクトリー v2
 * data format: [id, name, reading, fullName, oneLiner, analogy, detailedDesc, detailedImpact]
 */
const CATS = {
  'auto-parts':        { label: '自動車部品',          analogyDef: 'クルマの重要な構成部品' },
  'powertrain':        { label: 'パワートレイン',      analogyDef: 'クルマの心臓にあたるパワーの源' },
  'manufacturer':      { label: '自動車関連メーカー',   analogyDef: '自動車産業を支える企業群' },
  'regulation':        { label: '法規・規格',           analogyDef: 'クルマの安全を守る国際ルール' },
  'cybersecurity':     { label: 'サイバーセキュリティ', analogyDef: 'クルマを守るデジタルの盾' },
  'functional-safety': { label: '機能安全',             analogyDef: '万が一に備える安全の設計図' },
  'diagnostic':        { label: '診断通信',             analogyDef: 'クルマの健康状態を診る仕組み' },
};

function createTerms(category, rawData) {
  return rawData.map(item => {
    const [id, name, reading, fullName, oneLiner, analogy, detailedDesc, detailedImpact] = item;
    return {
      id, name, reading,
      fullName: fullName || '',
      aliases: [],
      oneLiner,
      category,
      desc: detailedDesc || oneLiner,
      analogy: analogy || (CATS[category] ? CATS[category].analogyDef : ''),
      impact: detailedImpact || '',
      keyPoints: [],
      related: [],
    };
  });
}

module.exports = { createTerms, CATS };
