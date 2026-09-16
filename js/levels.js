// levels.js
const Levels = {
  thresholds: [0, 200, 500, 1000, 2000, 4000],

  names: [
    "Простой Ёжик",
    "Улучшенный Ёжик",
    "Супер Ёжик",
    "Мега Ёжик",
    "Ультра Ёжик",
    "Легендарный Ёжик",
  ],

  expRewards: {
    action: 5,
    game: 10,
    hunt: 15,
    purchase: 5,
  },

  addExp(amount) {
    const s = Game.state;
    s.exp = (s.exp || 0) + amount;
    this.check();
  },

  check() {
    const s = Game.state;
    const exp = s.exp || 0;

    let newLevel = 1;
    for (let i = 0; i < this.thresholds.length; i++) {
      if (exp >= this.thresholds[i]) newLevel = i + 1;
    }

    if (newLevel > s.level) {
      s.level = newLevel;
      Sounds.play("levelup");
      UI.showMessage(`🎉 Новый уровень: ${this.getName(s.level)}!`);
    }
  },

  getDecayMultiplier() {
    return 1 + (Game.state.level - 1) * 0.2;
  },

  getName(level) {
    return this.names[level - 1] || "Ёжик";
  },

  getNextThreshold(level) {
    return this.thresholds[level] || null;
  },
};