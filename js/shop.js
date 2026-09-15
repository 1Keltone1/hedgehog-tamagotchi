// shop.js
const Shop = {
  items: [
    // === Одноразовые усилители ===
    {
      id: "vitamin",
      name: "Витамин",
      price: 15,
      description: "Мгновенно +30 здоровья",
      type: "instant",
      effect: { health: +30 },
    },
    {
      id: "star",
      name: "Звезда удачи",
      price: 20,
      description: "Следующая охота принесёт вдвое больше червячков",
      type: "buff",
      buff: "doubleHunt",
      duration: 0,
    },
    {
      id: "amulet",
      name: "Оберег",
      price: 25,
      description: "Здоровье не падает 60 секунд",
      type: "buff",
      buff: "noHealthDrop",
      duration: 60000,
    },

    // === Временные баффы ===
    {
      id: "honey",
      name: "Мёд",
      price: 10,
      description: "Голод падает в 2 раза медленнее 30 секунд",
      type: "buff",
      buff: "slowHunger",
      duration: 30000,
    },
    {
      id: "coffee",
      name: "Кофе",
      price: 10,
      description: "Бодрость падает в 2 раза медленнее 30 секунд",
      type: "buff",
      buff: "slowEnergy",
      duration: 30000,
    },
    {
      id: "music",
      name: "Музыка",
      price: 10,
      description: "Радость падает в 2 раза медленнее 30 секунд",
      type: "buff",
      buff: "slowJoy",
      duration: 30000,
    },

    // === Постоянные улучшения ===
    {
      id: "basket",
      name: "Корзина",
      price: 50,
      description: "Максимум всех шкал +50",
      type: "permanent",
      effect: "maxStatsUp",
    },
    {
      id: "feeder",
      name: "Кормушка",
      price: 40,
      description: "Еда восстанавливает на +10 больше голода",
      type: "permanent",
      effect: "betterFeed",
    },
    {
      id: "bed",
      name: "Уютная норка",
      price: 40,
      description: "Сон восстанавливает на +5 больше бодрости",
      type: "permanent",
      effect: "betterSleep",
    },
  ],

  purchased: {},
  activeBuffs: {},

  buy(itemId) {
    const s = Game.state;
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    if (s.money < item.price) {
      UI.showMessage("Недостаточно червячков!");
      return;
    }

    if (item.type === "permanent" && this.purchased[item.id]) {
      UI.showMessage("Уже куплено!");
      return;
    }

    s.money -= item.price;

    if (item.type === "instant") {
      for (const [stat, value] of Object.entries(item.effect)) {
        s[stat] = Math.min(this.getMaxStat(), s[stat] + value);
      }
    } else if (item.type === "buff") {
      this.activateBuff(item.buff, item.duration);
    } else if (item.type === "permanent") {
      this.purchased[item.id] = true;
    }

    Sounds.play("click");
    Levels.addExp(Levels.expRewards.purchase);
    UI.showMessage(`Куплено: ${item.name}`);
    Game.save();
    UI.render();
    this.renderItems();
  },

  getMaxStat() {
    return this.purchased.basket ? 150 : 100;
  },

  activateBuff(buffName, duration) {
    if (duration > 0) {
      this.activeBuffs[buffName] = Date.now() + duration;
      setTimeout(() => {
        delete this.activeBuffs[buffName];
      }, duration);
    } else {
      // Бессрочный бафф (до следующего использования)
      this.activeBuffs[buffName] = Infinity;
    }
  },

  isBuffActive(buffName) {
    const val = this.activeBuffs[buffName];
    return val && val > Date.now();
  },

  renderItems() {
    const container = document.getElementById("shop-items");
    container.innerHTML = "";

    this.items.forEach(item => {
      const div = document.createElement("div");
      div.className = "shop-item";

      const isOwned = item.type === "permanent" && this.purchased[item.id];
      const buttonText = isOwned ? "Куплено" : `Купить (${item.price})`;

      div.innerHTML = `
        <span>${item.name}</span>
        <button data-buy="${item.id}" ${isOwned ? "disabled" : ""}>${buttonText}</button>
        <div class="tooltip">${item.description}</div>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll("[data-buy]").forEach(btn => {
      btn.addEventListener("click", () => this.buy(btn.dataset.buy));
    });
  },

  save() {
    localStorage.setItem("hedgehog-shop", JSON.stringify({
      purchased: this.purchased,
      activeBuffs: this.activeBuffs,
    }));
  },

  load() {
    const saved = localStorage.getItem("hedgehog-shop");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.purchased = parsed.purchased || {};
        this.activeBuffs = parsed.activeBuffs || {};
      } catch (e) {
        this.purchased = {};
        this.activeBuffs = {};
      }
    }
  },
  
};