export const CHAPTERS = [
  { id: 'history', index: '01', name: '历史', english: 'HISTORY', glyphs: ['0', '1', '历', '史'], accent: '#A84832', secondary: '#D5B35C', panel: '#8F4A3B', coverImage: '/archive/chapter-covers/history.png' },
  { id: 'culture', index: '02', name: '文化', english: 'CULTURE', glyphs: ['0', '2', '文', '化'], accent: '#0B6B45', secondary: '#DDE5DA', panel: '#426657', coverImage: '/archive/chapter-covers/culture.png' },
  { id: 'disciplines', index: '03', name: '学科', english: 'DISCIPLINES', glyphs: ['0', '3', '学', '科'], accent: '#315A78', secondary: '#92B9BB', panel: '#657E8A', coverImage: '/archive/chapter-covers/disciplines.png' },
  { id: 'campuses', index: '04', name: '校园', english: 'CAMPUSES', glyphs: ['0', '4', '校', '园'], accent: '#C77A3D', secondary: '#D9C49B', panel: '#9A694B', coverImage: '/archive/chapter-covers/campuses.png' },
  { id: 'messages', index: '05', name: '寄语', english: 'MESSAGES', glyphs: ['0', '5', '寄', '语'], accent: '#0B6B45', secondary: '#D5B35C', panel: '#355D4B' },
]

export const ARCHIVE_BOOKS = [
  {
    id: 'history-book',
    chapter: 'history',
    number: 'A-01',
    title: '百年校史',
    english: 'CENTURY HISTORY',
    subtitle: '1924—2024',
    description: '从国立广东大学出发，翻阅中山大学的百年时间线。',
    coverGlyph: '史',
    coverImage: '/archive/chapter-covers/history.png',
    accent: '#A84832',
    secondary: '#D5B35C',
    panel: '#8F4A3B',
    spreads: [
      {
        left: { kicker: 'ORIGIN · 1924', title: '国立广东大学', body: '1924年，孙中山先生整合广州地区多所学校，创立国立广东大学，为中山大学的发展揭开序章。' },
        right: { kicker: 'TIMELINE · 01', title: '百年弦歌', body: '校名、院系与校园几经变迁，求学报国的精神始终贯穿百年办学历程。' },
      },
      {
        left: { kicker: 'CAMPUS MEMORY', title: '康乐园', body: '红楼、绿瓦、古木与海棠窗，共同构成广州南校园独特的历史空间。' },
        right: { kicker: 'TO BE CONTINUED', title: '新的百年', body: '从广州到珠海、深圳，中山大学正在三校区五校园续写新的篇章。' },
      },
    ],
  },
  {
    id: 'culture-book',
    chapter: 'culture',
    number: 'A-02',
    title: '中大文化',
    english: 'SYSU CULTURE',
    subtitle: '博学 · 审问 · 慎思 · 明辨 · 笃行',
    description: '校训、校歌、海棠窗与校园精神的文化档案。',
    coverGlyph: '文',
    coverImage: '/archive/chapter-covers/culture.png',
    accent: '#0B6B45',
    secondary: '#DDE5DA',
    panel: '#426657',
    spreads: [
      {
        left: { kicker: 'MOTTO', title: '博学 · 审问', body: '广泛学习、详细询问，在知识与实践之间不断追问真理。' },
        right: { kicker: 'MOTTO', title: '慎思 · 明辨 · 笃行', body: '审慎思考、清晰辨别，并以坚定的行动完成知与行的统一。' },
      },
      {
        left: { kicker: 'SYMBOL', title: '海棠式校徽', body: '海棠窗轮廓与中大建筑意象相连，形成鲜明而典雅的学校视觉记忆。' },
        right: { kicker: 'SPIRIT', title: '敢为人先', body: '开放、包容与担当，持续塑造中大师生共同的精神气质。' },
      },
    ],
  },
  {
    id: 'discipline-book',
    chapter: 'disciplines',
    number: 'A-03',
    title: '学科图谱',
    english: 'DISCIPLINE MAP',
    subtitle: '十一项一流学科',
    description: '以图谱方式连接中大的优势学科与研究方向。',
    coverGlyph: '学',
    coverImage: '/archive/chapter-covers/disciplines.png',
    accent: '#315A78',
    secondary: '#92B9BB',
    panel: '#657E8A',
    spreads: [
      {
        left: { kicker: 'DISCIPLINES · 01', title: '文理医工农艺', body: '多学科基础共同构成综合性、研究型大学的学术版图。' },
        right: { kicker: 'DOUBLE FIRST-CLASS', title: '优势学科图谱', body: '围绕十一项“双一流”建设学科，展开研究方向与学术成果介绍。' },
      },
      {
        left: { kicker: 'RESEARCH', title: '面向前沿', body: '基础研究、临床医学、人工智能与海洋科学等方向不断交叉融合。' },
        right: { kicker: 'EDUCATION', title: '育人为本', body: '把学术探索与人才培养连接起来，形成完整的知识网络。' },
      },
    ],
  },
  {
    id: 'campus-book',
    chapter: 'campuses',
    number: 'A-04',
    title: '五园纪行',
    english: 'FIVE CAMPUSES',
    subtitle: '三校区 · 五校园',
    description: '穿行广州、珠海与深圳，打开五个校园的风景册。',
    coverGlyph: '园',
    coverImage: '/archive/chapter-covers/campuses.png',
    accent: '#C77A3D',
    secondary: '#D9C49B',
    panel: '#9A694B',
    spreads: [
      {
        left: { kicker: 'GUANGZHOU', title: '南 · 北 · 东校园', body: '历史建筑、医学传统与现代大学城空间，共同组成广州校区。' },
        right: { kicker: 'ZHUHAI', title: '山海相望', body: '珠海校区沿山面海，长廊与教学建筑构成开阔的滨海校园景观。' },
      },
      {
        left: { kicker: 'SHENZHEN', title: '湾区新章', body: '深圳校区面向国家战略与粤港澳大湾区，发展医学、工学与新兴交叉学科。' },
        right: { kicker: 'FIVE CAMPUSES', title: '五园同心', body: '三校区五校园各具风貌，又共同承载中山大学的学术与文化传统。' },
      },
    ],
  },
]
