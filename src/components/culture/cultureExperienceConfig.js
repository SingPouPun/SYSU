export const CULTURE_PALETTE = {
  sysuGreen: '#006633',
  deepGreen: '#003b2a',
  paper: '#f0ebdd',
  inkBlack: '#050706',
}

export const CULTURE_ASSETS = {
  emblem: {
    full: '/branding/sysu-emblem.png',
    haitang: '/culture/haitang-window.png',
  },
  opening: [
    { src: '/culture/historical-clock-tower-latest.png', fit: 'contain' },
  ],
}

const line = (index, position) => ({
  src: `/culture/anthem-line-${String(index).padStart(2, '0')}.png`,
  position,
})

export const CULTURE_ANTHEM_SCENES = [
  { src: '/culture/anthem-scene-01.png', lines: [line(1, 'top-left')] },
  { src: '/culture/anthem-scene-02.png', lines: [line(2, 'bottom-right')] },
  { src: '/culture/anthem-scene-03.png', lines: [line(3, 'top-right'), line(4, 'bottom-left')] },
  { src: '/culture/anthem-scene-04.png', lines: [line(5, 'top-left'), line(6, 'bottom-right')] },
  { src: '/culture/motto-calligraphy.png', lines: [] },
  { src: '/culture/anthem-scene-06.png', lines: [line(11, 'top-right'), line(12, 'bottom-left')] },
  { src: '/culture/anthem-scene-07.png', lines: [line(13, 'top-left'), line(14, 'top-right')] },
  {
    src: '/culture/anthem-scene-08.png',
    lines: [line(15, 'top-right'), line(16, 'bottom-left')],
  },
  {
    src: '/culture/anthem-scene-09.png',
    lines: [line(17, 'top-left'), line(18, 'bottom-right')],
  },
  {
    src: '/culture/huaishi-hall.png',
    lines: [],
    reveal: '/culture/sun-yat-sen-stone.png',
  },
]

export const CULTURE_SHOT_ONE = {
  scrollLength: 28000,
  endProgress: 1,
  introEnd: 0.2,
  outroStart: 0.93,
}
