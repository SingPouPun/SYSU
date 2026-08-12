export const MOTION = {
  opening: {
    total: 5,
    tilesEnterAt: 0,
    wrongNameHoldAt: 0.8,
    scanAt: 1.8,
    reorderAt: 2.5,
    correctNameHoldAt: 3.6,
    revealAt: 4.4,
  },
  chapterTransition: {
    total: 1.55,
    cover: 0.35,
    lock: 0.4,
    reveal: 0.65,
  },
  book: {
    approach: 0.65,
    coverOpen: 0.9,
    pageGust: 1.2,
  },
}

export const EASE = {
  snap: 'power4.inOut',
  impact: 'back.out(1.6)',
  paper: 'power2.inOut',
}
