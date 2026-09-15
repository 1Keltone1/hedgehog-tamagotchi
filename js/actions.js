// actions.js
const Actions = {
  config: {
    eat: {
      stat: "hunger", delta: +25, energy: -5,
      sound: "eat", text: "Ёжик кушает...",
    },
    sleep: {
      stat: "energy", delta: +30, hunger: -5,
      sound: "sleep", text: "Ёжик спит...",
    },
    wash: {
      stat: "clean", delta: +30, joy: -5,
      sound: "wash", text: "Ёжик моется...",
    },
    heal: {
      stat: "health", delta: +25, energy: -5,
      sound: "heal", text: "Ёжик лечится...",
    },
  },

  do(action) {
    const s = Game.state;
    if (s.isDead) return;

    const cfg = this.config[action];
    if (!cfg) return;

    if (action === "sleep" && s.isSleeping) return;
    if (action !== "sleep" && s.isSleeping) s.isSleeping = false;

    const maxStat = Shop.getMaxStat();

    if (cfg.stat) s[cfg.stat] = Math.min(maxStat, s[cfg.stat] + cfg.delta);

    // Постоянные улучшения
    if (action === "eat" && Shop.purchased.feeder) {
      s.hunger = Math.min(maxStat, s.hunger + 10);
    }
    if (action === "sleep" && Shop.purchased.bed) {
      s.energy = Math.min(maxStat, s.energy + 5);
    }

    if (cfg.energy) s.energy = Math.max(0, s.energy + cfg.energy);
    if (cfg.hunger) s.hunger = Math.max(0, s.hunger + cfg.hunger);
    if (cfg.joy)    s.joy    = Math.max(0, s.joy + cfg.joy);

    if (action === "sleep") s.isSleeping = true;

    s.actionCounter[action] = (s.actionCounter[action] || 0) + 1;
    const gifIndex = ((s.actionCounter[action] - 1) % GIFS[action].length) + 1;

    UI.showActionGif(action, gifIndex, cfg.text);
    Sounds.play(cfg.sound);
    Levels.addExp(Levels.expRewards.action);

    Game.save();
    UI.render();
  },

  playGame(gameKey) {
    const s = Game.state;
    if (s.isDead) return;

    const game = GAMES[gameKey];
    if (!game) return;

    if (s.energy < game.energyCost) {
      UI.showMessage("Ёжик слишком устал для этой игры!");
      return;
    }

    const maxStat = Shop.getMaxStat();

    s.joy    = Math.min(maxStat, s.joy + game.joyBonus);
    s.energy = Math.max(0, s.energy - game.energyCost);
    s.hunger = Math.max(0, s.hunger - 5);

    UI.showGameGif(gameKey, `Ёжик играет в ${game.name}!`);
    Sounds.play("play");
    Levels.addExp(Levels.expRewards.game);

    Game.save();
    UI.render();
  },

  hunt() {
    const s = Game.state;
    if (s.isDead) return;

    const minStat = Math.min(s.hunger, s.joy, s.energy, s.clean, s.health);
    if (minStat < 30) {
      UI.showMessage("Ёжик слишком слаб для охоты!");
      return;
    }

    s.hunger = Math.max(0, s.hunger - 15);
    s.energy = Math.max(0, s.energy - 20);
    s.clean  = Math.max(0, s.clean - 10);

    // Базовое вознаграждение
    const baseReward = Math.floor(Math.random() * 5) + 3; // 3–7

    // Проверяем бафф
    let finalReward = baseReward;
    let usedStar = false;

    if (Shop.isBuffActive("doubleHunt")) {
      finalReward = baseReward * 2;
      usedStar = true;
      delete Shop.activeBuffs.doubleHunt;
      Shop.save(); 
    }

    s.money += finalReward;

    s.actionCounter.hunt = (s.actionCounter.hunt || 0) + 1;
    const gifIndex = ((s.actionCounter.hunt - 1) % GIFS.hunt.length) + 1;

    let message;
    if (usedStar) {
      message = `Ёжик принёс ${baseReward} × 2 = ${finalReward} червячков!`;
    } else {
      message = `Ёжик принёс ${finalReward} червячков!`;
    }

    UI.showActionGif("hunt", gifIndex, message);
    Sounds.play("hunt");
    Levels.addExp(Levels.expRewards.hunt);

    Game.save();
    UI.render();
  },
};