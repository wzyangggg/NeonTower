'use strict';

const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');
const {width, height} = canvas;
const tile = 40;
const tau = Math.PI * 2;
const down = Math.PI / 2;
const duration = 14;
const step = 1 / 120;
const gateWarning = 1.03;
const gateDuration = 1.92;
const sweepWarning = .95;
const sweepDuration = 3.2;
const mineWarning = 1.08;
const mineDuration = 1.65;
const checkerWarning = .72;
const checkerDuration = 1.11;
const boss = {x: width / 2, y: 114};
const player = {x: width / 2, y: height - 92, r: 5, invincible: 0, polarity: 0};
const cyan = '#63f5df';
const pink = '#ff79b3';
const gold = '#ffd07a';
const purple = '#b99cff';
const polarColors = ['#bdf7ff', '#f4a4ff'];

const patterns = [
  {
    name: '逆旋双螺旋', kind: '01 / 持续转向', period: .105,
    detail: '两组炮口反向旋转，出膛后的弹也继续向各自一侧弯曲，交织成流动的缝。',
    dodge: '跟着缝移动，避免停在两股弹流的交点。',
    fire(n) {
      for (const sign of [-1, 1]) {
        for (let arm = 0; arm < 2; arm++) {
          shoot(n * .22 * sign + arm * Math.PI + sign * .7, 135, sign < 0 ? cyan : pink,
            {turn: sign * .54});
        }
      }
    },
  },
  {
    name: '折翼雨', kind: '02 / 延迟折向', period: .19,
    detail: '弹先斜飞张开，经过一段延迟才折向下方，侧边也会落雨。',
    dodge: '观察弹尖变亮，等它折向后再穿过雨线。',
    fire(n) {
      for (const sign of [-1, 1]) {
        const fan = Math.sin(n * .47) * .33;
        for (let i = 0; i < 3; i++) {
          shoot(down + sign * (1.15 + fan + i * .19), 97 + i * 17, purple,
            {motion: 'bend', delay: .53 + i * .13});
        }
      }
    },
  },
  {
    name: '停弹再加速', kind: '03 / 速度变相', period: 2.8,
    detail: '一批弹先铺开，在中场悬停，短暂亮起后原向加速冲刺。',
    dodge: '悬停时先换到弹列之间，留出冲刺的反应距离。',
    fire(n) {
      for (let i = 0; i < 12; i++) {
        for (const speed of [190, 254]) {
          shoot(down + (i - 5.5) * .118 + Math.sin(n * 1.6) * .075, speed, cyan,
            {motion: 'stop', r: 4});
        }
      }
    },
  },
  {
    name: '裂变花雷', kind: '04 / 二次发射', period: 1.85,
    detail: '三颗母弹飞到中场，先减速和闪出预警圈，再从落点各喷一朵子弹花。',
    dodge: '绕开母弹的落点，从两朵花之间穿过去。',
    fire(n) {
      for (const offset of [-1, 0, 1]) {
        shoot(down + offset * .61 + Math.sin(n) * .12, 165, gold,
          {motion: 'split', delay: 1.28 + Math.abs(offset) * .2, r: 9});
      }
    },
  },
  {
    name: '卫星弹释放', kind: '05 / 公转脱离', period: 2.9,
    detail: '两层子弹绕首领公转并向外扩张，随后分批脱轨，沿切线掠出。',
    dodge: '留意发亮的外层弹，先避开它们即将切出的方向。',
    fire(n) {
      for (let i = 0; i < 16; i++) {
        const outer = i % 2 === 0;
        const angle = i * tau / 16 + n * .44;
        const radius = outer ? 62 : 37;
        shoot(angle, 144, outer ? cyan : purple, {
          motion: 'orbit', radius, delay: outer ? 1.12 : 1.7, spin: outer ? 1.84 : -2.25,
          x: boss.x + Math.cos(angle) * radius, y: boss.y + Math.sin(angle) * radius,
        });
      }
    },
  },
  {
    name: '错位弹墙', kind: '06 / 移动缺口', period: 1.58,
    detail: '两侧炮口交替推出竖向弹墙，缺口每波上下错开。',
    dodge: '先走到下一波的缺口高度，再穿过弹墙。',
    fire(n) {
      const fromLeft = n % 2 === 0;
      const gap = [14, 10, 12, 15, 8, 11][n % 6];
      for (let row = 0; row < 19; row++) {
        if (Math.abs(row - gap) <= 1) continue;
        for (const offset of [-8, 8]) {
          shoot(fromLeft ? 0 : Math.PI, 134, fromLeft ? cyan : pink,
            {x: fromLeft ? -8 : width + 8, y: (row + .5) * tile + offset, r: 5});
        }
      }
    },
  },
  {
    name: '点名与封路', kind: '07 / 瞄准连发', period: .28,
    detail: '粉弹每次开火都重新瞄准，青弹从顶部沿固定路线下压。',
    dodge: '沿空位小步引弹，等一串粉弹过去再换到另一条路线。',
    fire(n) {
      if (n % 10 < 7) {
        const aim = Math.atan2(player.y - boss.y, player.x - boss.x);
        for (const offset of [-.09, 0, .09]) shoot(aim + offset, 208, pink);
      }
      if (n % 4 === 0) {
        for (let col = 0; col < 9; col += 2) {
          shoot(down, 117, cyan, {x: (col + .5) * tile, y: -8, r: 5});
        }
      }
    },
  },
  {
    name: '回收镰刃', kind: '08 / 折返路线', period: 1.64,
    detail: '镰刃斜向飞远，在下半场拐弯，从偏移后的路线折返上行。',
    dodge: '第一次躲开后继续看弹尖，折返会占用另一条通道。',
    fire(n) {
      for (const sign of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
          shoot(down + sign * (.07 + i * .064), 215 + (n % 2) * 13, sign < 0 ? gold : pink,
            {motion: 'return', delay: 1.86 + i * .09, turn: -sign * 4.25, r: 6});
        }
      }
    },
  },
  {
    name: '预警闸门', kind: '09 / 场地封锁', period: 2.65,
    detail: '虚线区域先预警，再亮成贯穿场地的伤害光带，每次只留一条双格通道。',
    dodge: '虚线阶段就往空白通道移动，等光带熄灭再横穿。',
    fire(n) {
      const gap = [3, 6, 2, 5, 1][n % 5];
      gate = {left: gap * tile, right: (gap + 2) * tile, age: 0};
    },
  },
  {
    name: '双色极性', kind: '10 / 规则变化', period: .52, polarity: true,
    detail: '青色圆弹与紫色菱弹交错推进，判定点会吸收同色同形的子弹。',
    dodge: '按 C 或点「切换极性」，用同色弹流当作通道。',
    fire(n) {
      for (let col = 0; col < 9; col++) {
        const polarity = (col + Math.floor(n / 3)) % 2;
        shoot(down, 149, polarColors[polarity],
          {x: (col + .5) * tile, y: -10, r: 6, polarity});
      }
    },
  },
  {
    name: '蛇形弹道', kind: '11 / 周期摆动', period: .29,
    detail: '弹沿纵向前进，同时以相反的相位左右摆动，两股弹流会反复交换位置。',
    dodge: '先看弹往哪边摆，等一股弹流扫开后穿过去。',
    fire(n) {
      for (const sign of [-1, 1]) {
        for (const lane of [65, 180, 295]) {
          shoot(down, 146, sign < 0 ? cyan : pink, {
            x: lane, y: -9, lane, motion: 'wave', sway: sign * 42,
            wavePhase: n % 2 ? .55 : 0,
          });
        }
      }
    },
  },
  {
    name: '双侧追踪弹', kind: '12 / 有限追踪', period: 1.76,
    detail: '两侧各发三枚弯弹。弹在前两秒持续追踪，但转弯有限，之后会沿最后方向飞走。',
    dodge: '先往一边引，等弹转过来后从侧面甩开。',
    fire(n) {
      const y = 105 + (n % 3) * 72;
      for (const sign of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          shoot(down + sign * (.66 + i * .22), 134 + i * 12, sign < 0 ? gold : purple, {
            x: sign < 0 ? 18 : width - 18, y: y + i * 25,
            motion: 'homing', turn: 1.25, lifetime: 5.3, r: 6,
          });
        }
      }
    },
  },
  {
    name: '缩圈留门', kind: '13 / 向心合围', period: 2.7,
    detail: '一圈弹从外围同时收向中心，故意缺掉一段，下一圈的出口会换边。',
    dodge: '人在圈内就沿缺口出圈，避免跟着弹往中心退。',
    fire(n) {
      const centerY = 490 - (n % 2) * 90;
      const gap = [7, 12, 2, 22][n % 4];
      for (let i = 0; i < 28; i++) {
        const distance = Math.min(Math.abs(i - gap), 28 - Math.abs(i - gap));
        if (distance <= 2) continue;
        const angle = i * tau / 28;
        const dx = Math.cos(angle) * 164;
        const dy = Math.sin(angle) * 235;
        shoot(Math.atan2(-dy, -dx), Math.hypot(dx, dy) / 2.05, distance === 3 ? gold : pink, {
          x: boss.x + dx, y: centerY + dy, lifetime: 1.99, r: 5.5,
        });
      }
    },
  },
  {
    name: '雷达扫线', kind: '14 / 旋转光束', period: 3.4, emitterY: 367,
    detail: '中央炮台先用虚线标出起始方向，随后双向光束持续转动，每轮反向。',
    dodge: '从虚线背后起步，沿同一方向绕行，等光束熄灭再换边。',
    fire(n) {
      sweep = {age: 0, start: n % 2 ? 2.15 : .18, spin: n % 2 ? -.88 : .88, hit: false};
    },
  },
  {
    name: '航迹雷区', kind: '15 / 延时布雷', period: 2.45,
    detail: '布雷机横穿场地，沿航迹逐颗放雷。地雷先标出范围，再按布设顺序爆炸。',
    dodge: '在前几颗起爆时绕过后几颗的预警圈，或者等整条航迹熄灭。',
    fire(n) {
      const fromLeft = n % 2 === 0;
      shoot(fromLeft ? 0 : Math.PI, 226, gold, {
        x: fromLeft ? -12 : width + 12, y: [654, 510, 570, 435][n % 4],
        motion: 'minelayer', nextDrop: .21, r: 7,
      });
    },
  },
  {
    name: '棋盘节拍', kind: '16 / 交替地板', period: 1.32,
    detail: '棋盘格隔一格预警，随后同时亮起。下一拍交换危险格和安全格。',
    dodge: '看到脚下有虚线就横移或纵移一格，斜移会踩到同一组。',
    fire(n) {
      checker = {age: 0, parity: n % 2, hit: false};
    },
  },
];

const el = id => document.getElementById(id);
const phase = el('phase');
const timeline = el('timeline');
const keys = new Set();
const movement = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
const patternButtons = patterns.map(({name}, i) => {
  const button = document.createElement('button');
  const number = document.createElement('span');
  button.type = 'button';
  number.textContent = padded(i + 1);
  button.append(number, name);
  button.addEventListener('click', () => select(i));
  el('catalog').append(button);
  return button;
});

let index = 0;
let bullets = [];
let gate = null;
let sweep = null;
let checker = null;
let mines = [];
let clock = 0;
let volley = 0;
let nextFire = .38;
let hits = 0;
let absorbed = 0;
let paused = false;
let slow = false;
let auto = false;
let pointer = null;
let carry = 0;

function padded(value) {
  return String(value).padStart(2, '0');
}

function clearCycle() {
  bullets = [];
  gate = null;
  sweep = null;
  checker = null;
  mines = [];
  clock = 0;
  volley = 0;
  nextFire = .38;
}

function select(i) {
  index = (i + patterns.length) % patterns.length;
  const pattern = patterns[index];
  clearCycle();
  boss.y = pattern.emitterY ?? 114;
  Object.assign(player, {x: width / 2, y: height - 92, invincible: 0, polarity: 0});
  hits = 0;
  absorbed = 0;
  el('scene-id').textContent = `PATTERN ${padded(index + 1)}`;
  el('pattern-name').textContent = pattern.name;
  el('pattern-kind').textContent = pattern.kind;
  el('pattern-detail').textContent = pattern.detail;
  el('pattern-dodge').textContent = pattern.dodge;
  el('polarity').hidden = !pattern.polarity;
  updatePolarityButton();
  patternButtons.forEach((button, j) => button.setAttribute('aria-current', j === index));
}

function shoot(angle, speed, color, options = {}) {
  bullets.push({x: boss.x, y: boss.y, angle, speed, color, r: 4.5, age: 0, ...options});
}

function moveBullet(b, dt) {
  b.age += dt;
  if (b.age >= (b.lifetime ?? Infinity)) return false;
  let speed = b.speed;
  switch (b.motion) {
    case 'bend': {
      if (b.age > b.delay) {
        const delta = down - b.angle;
        b.angle += Math.sign(delta) * Math.min(Math.abs(delta), dt * 4.1);
        speed += Math.min((b.age - b.delay) * 83, 60);
      }
      break;
    }
    case 'stop':
      if (b.age > 1.7) speed = Math.min(365, 80 + (b.age - 1.7) * 940);
      else speed *= Math.max(0, 1 - (b.age / .92) ** 2);
      break;
    case 'split':
      if (b.age >= b.delay) {
        const offset = b.angle + b.x * .016;
        for (let i = 0; i < 13; i++) {
          shoot(offset + i * tau / 13, 131 + (i % 2) * 23, i % 2 ? gold : pink,
            {x: b.x, y: b.y, r: 4});
        }
        return false;
      }
      speed *= Math.max(0, 1 - (b.age / 1.26) ** 2);
      break;
    case 'orbit': {
      const offset = b.angle + b.spin * Math.min(b.age, b.delay);
      if (b.age < b.delay) {
        const radius = b.radius + b.age * 29;
        b.x = boss.x + Math.cos(offset) * radius;
        b.y = boss.y + Math.sin(offset) * radius;
        b.heading = offset + Math.sign(b.spin) * down;
        return true;
      }
      b.angle = offset + Math.sign(b.spin) * down;
      b.motion = null;
      break;
    }
    case 'return': {
      const turning = b.age - b.delay;
      if (turning > 0 && turning < Math.PI / Math.abs(b.turn)) b.angle += b.turn * dt;
      break;
    }
    case 'wave': {
      const previousX = b.x;
      b.x = b.lane + Math.sin(b.age * 4.75 + b.wavePhase) * b.sway;
      b.y += speed * dt;
      b.heading = Math.atan2(speed * dt, b.x - previousX);
      return b.y < height + 28;
    }
    case 'homing': {
      if (b.age < 2.05) {
        const aim = Math.atan2(player.y - b.y, player.x - b.x);
        const difference = aim - b.angle;
        const delta = Math.atan2(Math.sin(difference), Math.cos(difference));
        b.angle += Math.sign(delta) * Math.min(Math.abs(delta), b.turn * dt);
      }
      break;
    }
    case 'minelayer': {
      if (b.age >= b.nextDrop && b.x > 24 && b.x < width - 24) {
        mines.push({x: b.x, y: b.y, r: 29, age: 0, hit: false});
        b.nextDrop += .26;
      }
      break;
    }
    default:
      b.angle += (b.turn || 0) * dt;
  }
  b.heading = b.angle;
  b.x += Math.cos(b.angle) * speed * dt;
  b.y += Math.sin(b.angle) * speed * dt;
  const margin = 28;
  return b.x > -margin && b.x < width + margin && b.y > -margin && b.y < height + margin;
}

function movePlayer(dt) {
  let dx = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
  let dy = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'));
  if (pointer) {
    dx = pointer.x - player.x;
    dy = pointer.y - player.y;
  }
  const distance = Math.hypot(dx, dy);
  if (distance) {
    const travel = pointer ? Math.min(distance, 209 * dt) : 209 * dt;
    player.x = Math.max(10, Math.min(width - 10, player.x + dx / distance * travel));
    player.y = Math.max(10, Math.min(height - 10, player.y + dy / distance * travel));
  }
}

function hit() {
  if (player.invincible > 0) return;
  hits++;
  player.invincible = .7;
}

function sweepAngle() {
  return sweep.start + Math.max(0, sweep.age - sweepWarning) * sweep.spin;
}

function updateHazards(dt) {
  if (gate) {
    gate.age += dt;
    if (gate.age >= gateDuration) gate = null;
    else if (gate.age >= gateWarning && !gate.hit && (player.x - player.r < gate.left || player.x + player.r > gate.right)) {
      hit();
      gate.hit = true;
    }
  }
  if (sweep) {
    sweep.age += dt;
    if (sweep.age >= sweepDuration) sweep = null;
    else if (sweep.age >= sweepWarning && !sweep.hit) {
      const angle = sweepAngle();
      const distance = Math.abs((player.x - boss.x) * Math.sin(angle) - (player.y - boss.y) * Math.cos(angle));
      if (distance < player.r + 10) {
        hit();
        sweep.hit = true;
      }
    }
  }
  if (checker) {
    checker.age += dt;
    if (checker.age >= checkerDuration) checker = null;
    else if (checker.age >= checkerWarning && !checker.hit) {
      const tileParity = (Math.floor(player.x / tile) + Math.floor(player.y / tile)) % 2;
      if (tileParity === checker.parity) {
        hit();
        checker.hit = true;
      }
    }
  }
  for (let i = mines.length - 1; i >= 0; i--) {
    const mine = mines[i];
    mine.age += dt;
    if (mine.age >= mineDuration) mines.splice(i, 1);
    else if (mine.age >= mineWarning && !mine.hit && Math.hypot(player.x - mine.x, player.y - mine.y) < player.r + mine.r) {
      hit();
      mine.hit = true;
    }
  }
}

function simulate(dt) {
  clock += dt;
  if (clock >= duration) {
    if (auto) select(index + 1);
    else clearCycle();
  }
  movePlayer(dt);
  player.invincible = Math.max(0, player.invincible - dt);
  if (clock >= nextFire && nextFire < duration - 2.2) {
    patterns[index].fire(volley++);
    nextFire += patterns[index].period;
  }
  // Keep split children for the next step, without advancing them during their parent's step.
  const count = bullets.length;
  let kept = 0;
  for (let i = 0; i < count; i++) {
    const b = bullets[i];
    if (!moveBullet(b, dt)) continue;
    if (Math.hypot(b.x - player.x, b.y - player.y) < b.r + player.r) {
      if (b.polarity === player.polarity) {
        absorbed++;
        continue;
      }
      if (player.invincible === 0) {
        hit();
        continue;
      }
    }
    bullets[kept++] = b;
  }
  for (let i = count; i < bullets.length; i++) bullets[kept++] = bullets[i];
  bullets.length = kept;
  updateHazards(dt);
}

function buildFloor() {
  const floor = Object.assign(document.createElement('canvas'), {width, height});
  const art = floor.getContext('2d');
  const lighting = art.createLinearGradient(0, 0, width, height);
  lighting.addColorStop(0, '#152941');
  lighting.addColorStop(.48, '#101b30');
  lighting.addColorStop(1, '#121b2b');
  art.fillStyle = lighting;
  art.fillRect(0, 0, width, height);
  for (let y = 0; y < height; y += tile) {
    for (let x = 0; x < width; x += tile) {
      art.strokeStyle = '#2a3b54';
      art.strokeRect(x + .5, y + .5, tile - 1, tile - 1);
      art.fillStyle = '#52738a';
      art.fillRect(x + 3, y + 3, 2, 2);
    }
  }
  art.strokeStyle = '#476780';
  art.setLineDash([4, 7]);
  art.beginPath();
  art.moveTo(width / 2, 0);
  art.lineTo(width / 2, height);
  art.stroke();
  art.setLineDash([]);
  art.fillStyle = '#090f1c';
  for (const x of [0, width - 5]) art.fillRect(x, 0, 5, height);
  return floor;
}

function drawBoss() {
  const pulse = Math.max(0, 1 - (clock - nextFire + patterns[index].period) * 6);
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.fillStyle = '#08101d';
  ctx.strokeStyle = '#52718d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-34, -9);
  ctx.lineTo(-21, -22);
  ctx.lineTo(21, -22);
  ctx.lineTo(34, -9);
  ctx.lineTo(26, 18);
  ctx.lineTo(0, 25);
  ctx.lineTo(-26, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#304661';
  ctx.fillRect(-27, -7, 54, 13);
  ctx.fillStyle = '#1d5059';
  ctx.fillRect(-13, -11, 26, 21);
  ctx.fillStyle = pulse > .4 ? '#ecffff' : cyan;
  ctx.fillRect(-8, -4, 16, 7);
  ctx.fillStyle = '#6f8da9';
  ctx.fillRect(-29, 5, 12, 11);
  ctx.fillRect(17, 5, 12, 11);
  ctx.restore();
}

function drawBullet(b) {
  const bent = b.motion === 'bend' && b.age > b.delay;
  const charging = (b.motion === 'stop' && b.age >= 1.43 && b.age < 1.7)
    || (b.motion === 'split' && b.delay - b.age < .33)
    || (b.motion === 'orbit' && b.delay - b.age < .21);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.heading ?? b.angle);
  if (charging) {
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, b.r * 1.8 + Math.sin(b.age * 18) * 2, 0, tau);
    ctx.stroke();
  }
  ctx.fillStyle = b.color;
  ctx.globalAlpha = .18;
  ctx.beginPath();
  ctx.arc(0, 0, b.r + 3, 0, tau);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = bent || charging ? '#f8fcff' : b.color;
  ctx.beginPath();
  if (b.polarity === 1) {
    ctx.moveTo(b.r, 0);
    ctx.lineTo(0, b.r);
    ctx.lineTo(-b.r, 0);
    ctx.lineTo(0, -b.r);
    ctx.closePath();
  } else if (b.motion === 'return' || b.motion === 'homing') {
    ctx.moveTo(b.r * 1.5, 0);
    ctx.quadraticCurveTo(0, -b.r * 1.35, -b.r * 1.25, -b.r * .48);
    ctx.quadraticCurveTo(-b.r * .2, 0, -b.r * 1.25, b.r * .48);
    ctx.quadraticCurveTo(0, b.r * 1.35, b.r * 1.5, 0);
  } else if (b.motion === 'minelayer') {
    ctx.rect(-b.r, -b.r * .67, b.r * 2, b.r * 1.34);
  } else {
    const round = b.polarity === 0 || b.motion === 'split';
    ctx.ellipse(0, 0, b.r * (round ? 1 : 1.42), b.r * (round ? 1 : .68), 0, 0, tau);
  }
  ctx.fill();
  ctx.restore();
}

function drawGate() {
  if (!gate) return;
  const active = gate.age >= gateWarning;
  ctx.save();
  ctx.fillStyle = active ? '#ff537b53' : '#ffb15f24';
  ctx.fillRect(0, 0, gate.left, height);
  ctx.fillRect(gate.right, 0, width - gate.right, height);
  ctx.strokeStyle = active ? '#ff9bb5' : '#ffc37f';
  ctx.lineWidth = active ? 4 : 2;
  if (!active) ctx.setLineDash([9, 8]);
  ctx.beginPath();
  for (const x of [gate.left, gate.right]) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSweep() {
  if (!sweep) return;
  const active = sweep.age >= sweepWarning;
  const angle = sweepAngle();
  const dx = Math.cos(angle) * height;
  const dy = Math.sin(angle) * height;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(boss.x - dx, boss.y - dy);
  ctx.lineTo(boss.x + dx, boss.y + dy);
  if (active) {
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#fb5287a0';
    ctx.stroke();
  } else {
    ctx.setLineDash([12, 10]);
  }
  ctx.lineWidth = active ? 3 : 2;
  ctx.strokeStyle = active ? '#ffdbef' : gold;
  ctx.stroke();
  ctx.restore();
}

function drawMines() {
  ctx.save();
  for (const mine of mines) {
    const active = mine.age >= mineWarning;
    ctx.beginPath();
    ctx.arc(mine.x, mine.y, mine.r, 0, tau);
    ctx.fillStyle = active ? '#ff695f80' : '#ffbc6630';
    ctx.strokeStyle = active ? '#ffe0af' : gold;
    ctx.lineWidth = active ? 2.5 : 1.2;
    ctx.setLineDash(active ? [] : [4, 4]);
    ctx.fill();
    ctx.stroke();
    if (!active) {
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(mine.x, mine.y, mine.r - 4, -down, -down + tau * mine.age / mineWarning);
      ctx.stroke();
      ctx.fillStyle = gold;
      ctx.fillRect(mine.x - 3, mine.y - 3, 6, 6);
    }
  }
  ctx.restore();
}

function drawChecker() {
  if (!checker) return;
  const active = checker.age >= checkerWarning;
  ctx.save();
  ctx.fillStyle = active ? '#f8679b66' : '#ffbf5e26';
  ctx.strokeStyle = active ? '#ff91b6' : '#ffcc7c9e';
  if (!active) ctx.setLineDash([4, 5]);
  for (let row = 0; row < height / tile; row++) {
    for (let col = (row + checker.parity) % 2; col < width / tile; col += 2) {
      const x = col * tile;
      const y = row * tile;
      ctx.fillRect(x, y, tile, tile);
      ctx.strokeRect(x + 1, y + 1, tile - 2, tile - 2);
    }
  }
  ctx.restore();
}

function drawPlayer() {
  const color = patterns[index].polarity ? polarColors[player.polarity] : cyan;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.strokeStyle = player.invincible > 0 ? '#ff877d' : color;
  ctx.lineWidth = player.invincible > 0 ? 3 : 1.5;
  ctx.fillStyle = '#07101d';
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, tau);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  if (patterns[index].polarity && player.polarity === 1) ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  if (patterns[index].polarity && player.polarity === 1) ctx.rect(-3.5, -3.5, 7, 7);
  else ctx.arc(0, 0, player.r, 0, tau);
  ctx.fill();
  ctx.restore();
}

function phaseLabel() {
  if (paused) return '已暂停';
  if (gate) return gate.age < gateWarning ? '预警 · 进入空白通道' : '闸门激活';
  if (sweep) return sweep.age < sweepWarning ? '预警 · 光束起始方向' : '光束扫掠中';
  if (checker) return checker.age < checkerWarning ? '预警 · 换到无标记格' : '地板激活';
  return '';
}

function draw() {
  ctx.drawImage(floor, 0, 0);
  drawGate();
  drawChecker();
  drawMines();
  drawSweep();
  drawBoss();
  for (const b of bullets) drawBullet(b);
  drawPlayer();
  timeline.value = clock;
  const info = phaseLabel();
  if (phase.textContent !== info) phase.textContent = info;
  const score = `被弹 ${padded(hits)}${patterns[index].polarity ? ` · 吸收 ${padded(absorbed)}` : ''}`;
  if (el('hits').textContent !== score) el('hits').textContent = score;
}

function updatePolarityButton() {
  el('polarity').textContent = player.polarity === 0 ? '青圆 · 切换极性' : '紫菱 · 切换极性';
}

function flipPolarity() {
  if (!patterns[index].polarity) return;
  player.polarity = 1 - player.polarity;
  updatePolarityButton();
}

function togglePause() {
  paused = !paused;
  el('pause').textContent = paused ? '继续' : '暂停';
  el('pause').setAttribute('aria-pressed', paused);
}

el('prev').addEventListener('click', () => select(index - 1));
el('next').addEventListener('click', () => select(index + 1));
el('pause').addEventListener('click', togglePause);
el('restart').addEventListener('click', () => select(index));
el('polarity').addEventListener('click', flipPolarity);
el('slow').addEventListener('click', event => {
  slow = !slow;
  event.currentTarget.setAttribute('aria-pressed', slow);
});
el('auto').addEventListener('click', event => {
  auto = !auto;
  event.currentTarget.setAttribute('aria-pressed', auto);
});

window.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (movement.has(event.code)) {
    event.preventDefault();
    keys.add(event.code);
  } else if (event.code === 'Space' && !event.target.closest('button, summary, a')) {
    event.preventDefault();
    if (!event.repeat) togglePause();
  } else if (event.code === 'KeyC' && !event.repeat) flipPolarity();
});
window.addEventListener('keyup', event => keys.delete(event.code));
window.addEventListener('blur', () => {
  keys.clear();
  pointer = null;
});

function trackPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer = {
    id: event.pointerId,
    x: (event.clientX - rect.left) * width / rect.width,
    y: (event.clientY - rect.top) * height / rect.height,
  };
}

canvas.addEventListener('pointerdown', event => {
  if (pointer || event.button !== 0) return;
  canvas.setPointerCapture(event.pointerId);
  trackPointer(event);
});
canvas.addEventListener('pointermove', event => {
  if (pointer?.id === event.pointerId) trackPointer(event);
});
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  canvas.addEventListener(name, event => {
    if (pointer?.id === event.pointerId) pointer = null;
  });
}

const floor = buildFloor();
let previousFrame;
function frame(now) {
  if (previousFrame !== undefined && !paused) {
    carry += Math.min(.05, (now - previousFrame) / 1000) * (slow ? .5 : 1);
    while (carry >= step) {
      simulate(step);
      carry -= step;
    }
  }
  previousFrame = now;
  draw();
  requestAnimationFrame(frame);
}

el('pattern-count').textContent = `${patterns.length} PATTERNS`;
const requested = Number(new URLSearchParams(location.search).get('pattern'));
select(Number.isInteger(requested) && requested >= 1 && requested <= patterns.length ? requested - 1 : 0);
requestAnimationFrame(frame);
