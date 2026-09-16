// game.js
const Game = {
  state: {
    name: "Ёжик",
    level: 1,
    exp: 0,
    money: 0,
    hunger: 70,
    joy: 70,
    energy: 70,
    clean: 70,
    health: 100,
    isSleeping: false,
    isDead: false,
    actionCounter: {},
    lastUpdate: Date.now(),
  },

  init() {
    const saved = localStorage.getItem("hedgehog-tamagotchi");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this.state, parsed);
        UI.hideStartModal();
      } catch (e) {
        UI.showStartModal();
      }
    } else {
      UI.showStartModal();
    }
    this.startTick();
    UI.render();
  },

  createPet(name) {
    this.state = {
      name: name || "Ёжик",
      level: 1,
      exp: 0,
      money: 0,
      hunger: 70,
      joy: 70,
      energy: 70,
      clean: 70,
      health: 100,
      isSleeping: false,
      isDead: false,
      actionCounter: {},
      lastUpdate: Date.now(),
    };
    this.save();
    UI.hideStartModal();
    UI.render();
  },

  save() {
    localStorage.setItem("hedgehog-tamagotchi", JSON.stringify(this.state));
  },

  startTick() {
    setInterval(() => this.tick(), 3000);
  },

  tick() {
    const s = this.state;

    const mult = Levels.getDecayMultiplier();

    // Голод
    if (!Shop.isBuffActive("slowHunger")) {
      s.hunger = Math.max(0, s.hunger - Math.round(2 * mult));
    } else {
      s.hunger = Math.max(0, s.hunger - Math.round(1 * mult));
    }

    // Радость
    if (!Shop.isBuffActive("slowJoy")) {
      s.joy = Math.max(0, s.joy - Math.round(1 * mult));
    } else {
      s.joy = Math.max(0, s.joy - Math.round(0.5 * mult));
    }

    // Бодрость
    if (!s.isSleeping) {
      if (!Shop.isBuffActive("slowEnergy")) {
        s.energy = Math.max(0, s.energy - Math.round(2 * mult));
      } else {
        s.energy = Math.max(0, s.energy - Math.round(1 * mult));
      }
    } else {
      const sleepBonus = Shop.purchased.bed ? 10 : 5;
      s.energy = Math.min(Shop.getMaxStat(), s.energy + sleepBonus);
    }

    // Чистота
    s.clean = Math.max(0, s.clean - Math.round(1 * mult));

    // Здоровье
    if (!Shop.isBuffActive("noHealthDrop")) {
      let healthDrop = 1;
      const lowThreshold = 30;
      let lowCount = 0;
      if (s.hunger < lowThreshold) lowCount++;
      if (s.joy    < lowThreshold) lowCount++;
      if (s.energy < lowThreshold) lowCount++;
      if (s.clean  < lowThreshold) lowCount++;
      healthDrop += lowCount;

      s.health = Math.max(0, s.health - healthDrop);
    }

    // Восстановление
    const highThreshold = 80;
    if (
      s.hunger >= highThreshold &&
      s.joy    >= highThreshold &&
      s.energy >= highThreshold &&
      s.clean  >= highThreshold &&
      s.health < 100
    ) {
      s.health = Math.min(100, s.health + 1);
    }

    // Смерть
    if (s.health <= 0) {
      s.isDead = true;
      s.isSleeping = false;
      Sounds.play("death");
    }

    this.save();
    UI.render();
  },

  getMood() {
    if (this.state.isDead) return "dead";
    const avg = (
      this.state.hunger +
      this.state.joy +
      this.state.energy +
      this.state.clean +
      this.state.health
    ) / 5;
    if (avg >= 70) return "excellent";
    if (avg >= 40) return "normal";
    return "bad";
  },

  restart() {
    localStorage.clear();
    window.location.reload(true);
  },
};