'use strict';

const tiers = [
  ['普通', '普通', '#a8b7b5'],
  ['改良', '改良', '#78c997'],
  ['精良', '精良', '#6daee9'],
  ['史诗', '史诗', '#be8fdf'],
  ['传奇', '传说', '#e8b565'],
];
const grid = document.querySelector('#review-grid');
const jump = document.querySelector('#review-jump');
const chipIcon = '<img class="chip-icon" src="assets/chip-icons-v3/repeat-emblem-pixel.png" width="56" height="56" alt="">';

tiers.forEach(([equipmentGrade, chipGrade, color], index) => {
  const tier = index + 1;
  jump.insertAdjacentHTML('beforeend', `<a href="#tier-${tier}" style="--rarity:${color}">T${tier} ${equipmentGrade}</a>`);
  grid.insertAdjacentHTML('beforeend', `
    <article class="review-row" id="tier-${tier}" aria-labelledby="grade-${tier}" style="--rarity:${color}">
      <header class="review-tier">
        <span class="tier-index">T${tier}</span>
        <h2 id="grade-${tier}">${equipmentGrade}${equipmentGrade === chipGrade ? '' : ' / ' + chipGrade}</h2>
        <code>${color.toUpperCase()}</code>
        <span class="swatch" aria-hidden="true"></span>
      </header>
      <div class="review-cell" aria-label="商店装备">
        <div class="shop-stock-slot">
          <div class="choice shop-buy weapon-card" data-tier="${tier}">
            <span class="shop-card-hero" data-item-tier="${tier}">
              <span class="shop-card-rarity">${equipmentGrade}</span>
              <span class="shop-gift-box"><span class="shop-equipment-icon shop-box-pixel-icon"><img src="assets/shop-drop-icons/heavy-armor-48.png" width="48" height="48" alt=""></span></span>
              <svg class="shop-card-divider" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path d="M0 3H36L55 21H245L264 3H300V26H0Z"/></svg>
            </span>
            <span class="shop-card-info"><b>随机重型防弹衣</b></span>
          </div>
        </div>
      </div>
      <div class="review-cell" aria-label="已穿戴装备">
        <div class="shop-loadout-slot" data-item-tier="${tier}">
          <span class="shop-loadout-label">护甲</span>
          <span class="shop-loadout-icon equipment-pixel-icon"><img src="assets/equipment-icons/shell-48.png" width="40" height="40" alt=""></span>
          <b>防弹毛衣</b><small>${equipmentGrade}</small>
        </div>
      </div>
      <div class="review-cell" aria-label="获得芯片">
        <div class="result-loot-item result-loot-chip" data-item-tier="${tier}" role="img" aria-label="${chipGrade} · 复击回路" title="${chipGrade} · 复击回路">
          ${chipIcon}
        </div>
      </div>
      <div class="review-cell" aria-label="角色芯片库">
        <div class="chip-card" role="img" aria-label="芯片库 · ${chipGrade} · 复击回路">
          <span class="chip-core" data-item-tier="${tier}">${chipIcon}</span>
          <strong>复击回路</strong>
        </div>
      </div>
    </article>`);
});

const stylesheet = document.querySelector('#unified');
const note = document.querySelector('#review-note');
const buttons = document.querySelectorAll('[data-variant]');
function showVariant(variant) {
  const unified = variant === 'after';
  stylesheet.sheet.disabled = !unified;
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === variant)));
  note.textContent = unified
    ? '同档共用底色、旋转光和图标发光描边。'
    : '商店和角色芯片库的底板较亮，穿戴槽和结算芯片槽偏暗。';
}

buttons.forEach(button => button.addEventListener('click', () => showVariant(button.dataset.variant)));
showVariant('after');

const filter = document.querySelector('#review-filter');
function syncFilter() {
  NeonPostFX.settings.enabled = filter.checked;
  NeonPostFX.refresh();
}

// Use the game's saved effects, with bloom enabled and no camera warp on this scrollable page.
NeonPostFX.settings.bloom = true;
NeonPostFX.settings.bloomStrength ||= NeonPostFX.defaults.bloomStrength;
NeonPostFX.settings.distortion = false;
filter.addEventListener('change', syncFilter);
syncFilter();
