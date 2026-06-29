export function initRitual(root) {
  const card = root.querySelector('#ritual-card');
  const trigger = root.querySelector('#ritual-trigger');
  const readingEl = root.querySelector('#ritual-reading');
  const readingName = root.querySelector('#ritual-reading-name');
  const readingKw = root.querySelector('#ritual-reading-kw');
  const readingText = root.querySelector('#ritual-reading-text');
  if (!card || !trigger) return;

  const PREVIEW_DECK = [
    {n:'愚者 The Fool',k:'新开始 · 冒险 · 无限可能',r:'愚者站在悬崖边缘，脚下是无尽的虚空，却面带微笑。宇宙邀请你放下过度的计划，以赤子之心踏上未知的旅途。'},
    {n:'魔术师 The Magician',k:'创造力 · 意志 · 显化',r:'你手中已经有了所有需要的工具——智慧、热情、沟通力和行动力。关键在于集中精力，启动创造。'},
    {n:'女祭司 The High Priestess',k:'直觉 · 神秘 · 内在智慧',r:'最可靠的答案不在外界，而在你内心深处。静下来倾听那个微弱的声音。'},
    {n:'恋人 The Lovers',k:'选择 · 结合 · 价值观',r:'忠于内心的抉择——不是简单的对错判断，而是关于什么对你真正重要。听从你的心。'},
    {n:'命运之轮 Wheel of Fortune',k:'轮回 · 转机 · 命运之轮',r:'命运之轮正在转动。接受变化，因为轮子永远在转，低谷之后必有高峰。'},
    {n:'星星 The Star',k:'希望 · 灵感 · 宇宙祝福',r:'星星是宇宙送来的情书。希望正在重新降临，相信美好的事情正在路上。'},
    {n:'太阳 The Sun',k:'快乐 · 成功 · 生命之光',r:'阳光普照你的生活。享受这份光明，分享你的快乐，感染身边的每一个人。'},
    {n:'塔 The Tower',k:'突变 · 颠覆 · 真相揭示',r:'塔摧毁的都是建立在虚假地基上的建筑——真相揭示后，你才能建造更坚固的未来。'},
    {n:'月亮 The Moon',k:'幻象 · 潜意识 · 直觉引导',r:'事情不像表面看起来那样。不要急于下判断，让直觉引导你穿越幻象。'},
    {n:'力量 Strength',k:'勇气 · 耐心 · 温柔的力量',r:'真正的强大不是硬碰硬，而是以柔克刚。用温柔和理解去回应，比愤怒更有力量。'}
  ];

  let flipped = false;

  function flip() {
    if (flipped) return;
    flipped = true;
    card.classList.add('flipped');
    const pick = PREVIEW_DECK[Math.floor(Math.random() * PREVIEW_DECK.length)];
    setTimeout(() => {
      if (readingName) readingName.textContent = pick.n;
      if (readingKw) readingKw.textContent = pick.k;
      if (readingText) readingText.textContent = pick.r;
      if (readingEl) readingEl.classList.add('visible');
      trigger.textContent = '开始完整占卜';
      trigger.href = 'daily.html';
      trigger.onclick = (e) => { e.preventDefault(); window.location.href = 'daily.html'; };
    }, 900);
  }

  trigger.addEventListener('click', e => {
    e.preventDefault();
    if (!flipped) {
      flip();
    }
  });

  card.addEventListener('click', () => {
    if (!flipped) flip();
  });
}