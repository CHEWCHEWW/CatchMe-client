import Hero from "../gameObjects/Hero";
import Enemy from "../gameObjects/Enemy";
import ChaseHeroAI from "../ai/ChaseHeroAI";

import store from "../../store";
import { updateGameProgress } from "../../redux/slices/singlePlaySlice";
import { gameProgress } from "../../constants/gameState";

export default class Stage1 extends Phaser.Scene {
  constructor() {
    super("stage1");
  }

  init() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.registry.values.score = 0;
    this.registry.values.time = 0;
  }

  create() {
    this.add.image(1300, 400, "cloud").setDepth(1);
    this.add.image(0, 0, "cloud").setDepth(1);
    this.add.image(-800, 200, "cloud").setDepth(1);
    this.add.image(600, 150, "cloud").setDepth(1);
    this.add.image(-1300, 600, "cloud").setDepth(1);

    this.setTileMap();

    this.score = this.add
      .bitmapText(0, 0, "font", `SCORE: ${this.registry.values.score}`)
      .setDepth(7);
    this.countDown = this.add
      .bitmapText(0, 0, "font", `TIME:  ${this.registry.values.time}`)
      .setDepth(7);

    this.timer = this.time.delayedCall(90000, this.gameOver, [], this);

    this.hero = new Hero(this, 100, 550, "hero");
    this.enemy = new Enemy(this, 200, 200, "enemy");
    this.enemy1 = new Enemy(this, 600, 500, "enemy");

    this.enemy.setTargetIndicatorColor("#FCB4E3"); // 앞으로 삭제 될 예정..
    this.enemy1.setTargetIndicatorColor("#FCB72C");

    this.add.existing(this.hero).setDepth(5);
    this.add.existing(this.enemy).setDepth(5);
    this.add.existing(this.enemy1).setDepth(5);

    this.physics.world.enable(
      [this.hero, this.enemy, this.enemy1],
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );

    this.hero.body.setSize(40, 110, true);
    this.enemy.body.setSize(40, 110, true);
    this.enemy1.body.setSize(40, 110, true);

    this.enemy.setAI(new ChaseHeroAI(this.hero, this.enemy, this.boardLayer));
    this.enemy1.setAI(new ChaseHeroAI(this.hero, this.enemy1, this.boardLayer));

    this.physics.add.collider([this.enemy, this.enemy1]);

    this.physics.add.collider(this.hero, [this.enemy, this.enemy1], () => {
      this.stopStage();
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.setCoinToMap();

    this.cameras.main.startFollow(this.hero, true);
    this.cameras.main.setZoom(1);

    if (this.hero) {
      this.physics.add.overlap(
        this.hero,
        this.coins,
        this.handlePlayerGetCoin,
        this.checkIsCanPlayerGetCoin,
        this
      );
    }
  }

  update(time, delta) {
    this.score.x = this.hero.body.position.x + 350;
    this.score.y = this.hero.body.position.y - 300;

    this.score.setText(`SCORE: ${this.registry.values.score}`);

    this.countDown.x = this.hero.body.position.x + 180;
    this.countDown.y = this.hero.body.position.y - 300;

    const currentTime = this.timer.getProgress().toString().substr(0, 4);

    this.countDown.setText(`TIME: ${currentTime}`);

    this.hero?.handleMovement(
      delta,
      this.cursors,
      this.boardLayer,
      this.coinLayer
    );

    if (this.coinCount === 0) {
      this.moveNextStage();
    }
  }

  setTileMap() {
    this.map = this.add.tilemap("level1-map");

    const tileset = this.map.addTilesetImage("iso-level1", "tiles");

    this.boardLayer = this.map.createLayer("Tile Layer 1", tileset).setDepth(2);
    this.coinLayer = this.map.createLayer("Tile Layer 2", tileset);
  }

  setCoinToMap() {
    this.coins = this.coinLayer.createFromTiles(6, -1, { key: "coin" });

    this.coinCount = this.coins.length;

    this.coins.forEach((coin) => {
      this.physics.add.existing(coin);
      const body = coin.body;

      body.setCircle(38, 26, -6);
      coin.setDepth(4);
    });
  }

  stopStage() {
    this.cursors = null;

    this.enemy.unSubscribeAI();
    this.enemy1.unSubscribeAI();
    this.hero.setDie();
    // 이 사이에 다음 페이지로 넘어간다는 로고 띄우기..!
    this.time.addEvent({
      callback: () => {
        store.dispatch(updateGameProgress(gameProgress.GAME_OVER)); // event로 바꿔주기
      },
      delay: 2000,
    });
  }

  moveNextStage() {
    this.enemy.unSubscribeAI();
    this.enemy1.unSubscribeAI();
    // 이 사이에 다음 페이지로 넘어간다는 로고 띄우기..!
    this.time.addEvent({
      callback: () => {
        this.cameras.main.fadeOut(3000, 50, 50, 50);

        this.cameras.main.once(
          Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
          () => {
            this.scene.start("stage2");
          }
        );
      },
      delay: 2000,
    });
  }

  handlePlayerGetCoin(hero, coin) {
    coin.destroy(true);

    this.hero.getCoin();

    this.coinCount--;
    this.registry.values.score += 10;
  }

  checkIsCanPlayerGetCoin(hero, coin) {
    if (!this.hero) {
      return false;
    }

    return this.hero.canGetCoin(coin);
  }
}
