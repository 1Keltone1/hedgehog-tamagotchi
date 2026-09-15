// ui.js
const UI = {
  currentIdleSrc: "assets/images/idle-normal.png",
  actionTimeout: null,
  isActionPlaying: false,

  render() {
    const s = Game.state;

    // Шкалы
    document.getElementById("bar-hunger").style.width  = s.hunger + "%";
    document.getElementById("bar-joy").style.width     = s.joy + "%";
    document.getElementById("bar-energy").style.width  = s.energy + "%";
    document.getElementById("bar-clean").style.width   = s.clean + "%";
    document.getElementById("bar-health").style.width  = s.health + "%";

    // Верхняя панель
    document.getElementById("pet-name").textContent = s.name;
    document.getElementById("level-info").textContent =
      `Ур. ${s.level} — ${Levels.getName(s.level)}`;
    document.getElementById("money").textContent = `Червячки: ${s.money}`;

    // Ёжик — только если сейчас не показывается действие
    if (!this.isActionPlaying) {
      if (s.isDead) {
        this.setPetGif(GIFS.death, "🪦");
      } else {
        const mood = Game.getMood();
        this.currentIdleSrc = IDLE_IMAGES[mood];
        this.setPetGif(this.currentIdleSrc, "🦔");
      }
    }

    // Блокировка кнопок
    document.querySelectorAll("[data-action]").forEach(btn => {
      const action = btn.dataset.action;
      btn.disabled = s.isDead || (action === "sleep" && s.isSleeping);
    });

    Levels.check();
  },

  // Установка картинки или гифки с fallback
  setPetGif(src, fallbackEmoji = "🦔") {
    const img = document.getElementById("pet-gif");
    const fallback = document.getElementById("pet-fallback");

    // Пустая ссылка-плейсхолдер
    if (!src || src.startsWith("ссылкана")) {
      img.style.display = "none";
      fallback.textContent = fallbackEmoji;
      fallback.style.display = "block";
      return;
    }

    img.onerror = () => {
      img.style.display = "none";
      fallback.textContent = fallbackEmoji;
      fallback.style.display = "block";
    };

    img.onload = () => {
      img.style.display = "block";
      fallback.style.display = "none";
    };

    img.src = src;
  },

  showActionGif(action, index, text) {
    const gifUrl = GIFS[action] && GIFS[action][index - 1];
    if (!gifUrl) {
      this.showMessage(text);
      return;
    }

    if (this.actionTimeout) clearTimeout(this.actionTimeout);
    this.isActionPlaying = true;

    this.setPetGif(gifUrl, "🦔");
    document.getElementById("action-text").textContent = text;

    this.actionTimeout = setTimeout(() => {
      this.actionTimeout = null;
      this.isActionPlaying = false;
      document.getElementById("action-text").textContent = "";
      this.render();
    }, 4000);
  },

  showGameGif(gameKey, text) {
    const game = GAMES[gameKey];
    if (!game) return;

    if (this.actionTimeout) clearTimeout(this.actionTimeout);
    this.isActionPlaying = true;

    this.setPetGif(game.gif, "🎮");
    document.getElementById("action-text").textContent = text;

    this.actionTimeout = setTimeout(() => {
      this.actionTimeout = null;
      this.isActionPlaying = false;
      document.getElementById("action-text").textContent = "";
      this.render();
    }, 4000);
  },

  showWelcomeGif() {
    if (!GIFS.welcome || GIFS.welcome.startsWith("ссылкана")) return;

    this.isActionPlaying = true;
    this.setPetGif(GIFS.welcome, "🦔");
    document.getElementById("action-text").textContent = "Добро пожаловать!";

    setTimeout(() => {
      this.isActionPlaying = false;
      document.getElementById("action-text").textContent = "";
      this.render();
    }, 5000);
  },

  showMessage(text) {
    const el = document.getElementById("action-text");
    el.textContent = text;
    setTimeout(() => { el.textContent = ""; }, 3500);
  },

  showStartModal() {
    document.getElementById("start-modal").classList.remove("hidden");
  },
  hideStartModal() {
    document.getElementById("start-modal").classList.add("hidden");
  },
  showShopModal() {
    Shop.renderItems();
    document.getElementById("shop-modal").classList.remove("hidden");
  },
  hideShopModal() {
    document.getElementById("shop-modal").classList.add("hidden");
  },
  showGamesModal() {
    const container = document.getElementById("games-list");
    container.innerHTML = "";

    Object.entries(GAMES).forEach(([key, game]) => {
      const div = document.createElement("div");
      div.className = "shop-item";
      div.innerHTML = `
        <span>${game.name} (+${game.joyBonus} радости, −${game.energyCost} бодрости)</span>
        <button data-game="${key}">Играть</button>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll("[data-game]").forEach(btn => {
      btn.addEventListener("click", () => {
        UI.hideGamesModal();
        Actions.playGame(btn.dataset.game);
      });
    });

    document.getElementById("games-modal").classList.remove("hidden");
  },
  hideGamesModal() {
    document.getElementById("games-modal").classList.add("hidden");
  },
};

// Звуки
const Sounds = {
  cache: {},
  play(name) {
    if (!this.cache[name]) {
      this.cache[name] = new Audio(`assets/sounds/${name}.mp3`);
    }
    this.cache[name].currentTime = 0;
    this.cache[name].play().catch(() => {});
  },
};

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  Shop.load(); 
  Game.init();

  document.getElementById("start-btn").addEventListener("click", () => {
    const name = document.getElementById("name-input").value.trim();
    Game.createPet(name);
    UI.showWelcomeGif();
  });

  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if (action === "hunt")        Actions.hunt();
      else if (action === "shop")   UI.showShopModal();
      else if (action === "games")  UI.showGamesModal();
      else                          Actions.do(action);
    });
  });

  document.getElementById("close-shop").addEventListener("click", () => UI.hideShopModal());
  document.getElementById("close-games").addEventListener("click", () => UI.hideGamesModal());
    document.getElementById("restart-btn").addEventListener("click", () => {
    if (confirm("Начать заново? Весь прогресс будет удалён.")) {
      Game.restart();
    }
  });
});