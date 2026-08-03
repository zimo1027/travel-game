// 关卡数据
// canvas 逻辑尺寸 750x1334 (rpx 比例)
var LEVELS = [
  {
    name: '北京',
    subtitle: '首都之旅',
    bgColor: '#E8D5B7',
    roadColor: '#D4C4A8',
    grassColor: '#C8E6C9',
    width: 750,
    height: 900,
    playerStart: { x: 50, y: 750 },
    obstacles: [
      { x: 200, y: 100, w: 60, h: 180 },   // 树
      { x: 500, y: 200, w: 60, h: 160 },
      { x: 100, y: 400, w: 80, h: 60 },
      { x: 550, y: 500, w: 70, h: 70 },
      { x: 300, y: 600, w: 60, h: 60 },
    ],
    checkpoints: [
      { x: 350, y: 120, name: '天安门', desc: '位于北京市中心，是中国的象征' },
      { x: 600, y: 320, name: '故宫', desc: '明清两代的皇家宫殿，世界文化遗产' },
      { x: 400, y: 500, name: '天坛', desc: '明清皇帝祭天、祈谷的场所' },
      { x: 150, y: 600, name: '颐和园', desc: '中国现存最大的皇家园林' },
      { x: 550, y: 700, name: '鸟巢', desc: '2008年北京奥运会主体育场' },
    ],
  },
  {
    name: '西安',
    subtitle: '古都探秘',
    bgColor: '#F5E6CA',
    roadColor: '#E8D5B0',
    grassColor: '#D4C8A0',
    width: 750,
    height: 900,
    playerStart: { x: 650, y: 750 },
    obstacles: [
      { x: 150, y: 150, w: 80, h: 50 },
      { x: 350, y: 300, w: 60, h: 180 },
      { x: 550, y: 150, w: 50, h: 120 },
      { x: 200, y: 500, w: 70, h: 70 },
      { x: 480, y: 600, w: 80, h: 50 },
    ],
    checkpoints: [
      { x: 300, y: 100, name: '兵马俑', desc: '世界第八大奇迹，秦始皇陵陪葬坑' },
      { x: 620, y: 280, name: '大雁塔', desc: '唐代玄奘为保存佛经而建' },
      { x: 180, y: 380, name: '钟楼', desc: '西安市中心地标，建于明代' },
      { x: 400, y: 550, name: '古城墙', desc: '中国现存最完整的古代城垣' },
      { x: 150, y: 700, name: '华清宫', desc: '唐代皇家温泉行宫' },
    ],
  },
  {
    name: '成都',
    subtitle: '天府漫游',
    bgColor: '#E8F5E9',
    roadColor: '#C8E6C9',
    grassColor: '#B9DCC0',
    width: 750,
    height: 900,
    playerStart: { x: 400, y: 100 },
    obstacles: [
      { x: 100, y: 200, w: 60, h: 60 },
      { x: 500, y: 250, w: 70, h: 160 },
      { x: 250, y: 450, w: 60, h: 120 },
      { x: 600, y: 550, w: 80, h: 60 },
      { x: 150, y: 650, w: 60, h: 60 },
    ],
    checkpoints: [
      { x: 200, y: 120, name: '宽窄巷子', desc: '成都最具代表性的历史文化街区' },
      { x: 600, y: 180, name: '大熊猫基地', desc: '近距离观看国宝大熊猫' },
      { x: 350, y: 350, name: '武侯祠', desc: '纪念诸葛亮的祠堂，三国文化圣地' },
      { x: 500, y: 600, name: '锦里', desc: '西蜀历史上最古老的商业街' },
      { x: 200, y: 750, name: '都江堰', desc: '世界上年代最久的水利工程' },
    ],
  },
]

module.exports = LEVELS
