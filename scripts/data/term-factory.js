/**
 * 用語ファクトリー - コンパクトな配列データからフル用語オブジェクトを生成
 *
 * data format: [id, name, reading, fullName, oneLiner]
 * or:          [id, name, reading, fullName, oneLiner, analogy]
 */

const DEFAULT_ANALOGIES = {
  'auto-parts':         'クルマという体を支える骨や筋肉のような存在',
  'powertrain':         'クルマの心臓や血管にあたるパワーの源',
  'manufacturer':       '自動車産業を支えるプロフェッショナル集団',
  'regulation':         '交通ルールのように、みんなが守るべき共通の約束事',
  'cybersecurity':      'クルマを守るデジタルの盾や鎧',
  'functional-safety':  '万が一に備える安全の設計図',
  'diagnostic':         'クルマの健康状態を診る聴診器',
};

const DEFAULT_IMPACTS = {
  'auto-parts':         'この部品が正常に機能しないと、クルマの性能や安全性に大きく影響する',
  'powertrain':         'この技術はクルマの走行性能・燃費・環境性能に直結する重要な要素',
  'manufacturer':       'この企業は自動車産業のサプライチェーンにおいて非常に重要な役割を果たしている',
  'regulation':         'この規格・法規があることで、クルマの安全性や環境性能が世界的に確保されている',
  'cybersecurity':      '現代のコネクテッドカーでは、この技術がなければサイバー攻撃に対して無防備になってしまう',
  'functional-safety':  'この考え方は、クルマの電子制御システムが故障した際に人命を守るための根幹技術',
  'diagnostic':         'この仕組みは、クルマの故障診断やメンテナンスの現場で欠かせない技術',
};

function createTerms(category, rawData) {
  return rawData.map(item => {
    const [id, name, reading, fullName, oneLiner, analogy] = item;
    return {
      id,
      name,
      reading,
      fullName: fullName || '',
      aliases: [],
      oneLiner,
      category,
      desc: oneLiner,
      analogy: analogy || DEFAULT_ANALOGIES[category] || 'クルマ産業を支える重要な要素',
      impact: DEFAULT_IMPACTS[category] || '',
      keyPoints: [],
      related: [],
    };
  });
}

module.exports = { createTerms, DEFAULT_ANALOGIES, DEFAULT_IMPACTS };
