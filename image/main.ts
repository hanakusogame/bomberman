import { AssetManager, E, Font, PointMoveEvent, PointUpEvent } from "@akashic/akashic-engine";
import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject";

declare const window: RPGAtsumaruWindow;

export function main(param: GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["floor","kaeru"],
	});

	// 放送者を区別する
	let gameMasterId: string = null;
	g.game.onJoin.addOnce((e) => {
		gameMasterId = e.player.id;
	});

	// 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
	g.game.vars.gameState = { score: 0 };
	scene.onLoad.add(() => {
		//背景
		const bg = new g.FilledRect({
			scene: scene,
			width: g.game.width,
			height: g.game.height,
			cssColor: "black",
			opacity: 0.5,
			parent: scene,
		});

		const title = new g.FilledRect({
			scene: scene,
			width: g.game.width,
			height: g.game.height,
			cssColor: "white",
			parent: scene,
		});

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 50,
		});

		const label = new g.Label({
			scene: scene,
			font: font,
			text: "現状キーボードのみ　↑前進　↓後退　←→回転",
			fontSize: 50,
			textColor: "black",
			parent: scene,
			local: true,
		});

		let players: { [key: string]: Player } = {};

		// 参加ボタン
		const button = new g.FilledRect({
			scene: scene,
			x: (g.game.width - 200) / 2,
			y: (g.game.height - 80) / 2,
			width: 200,
			height: 80,
			cssColor: "yellow",
			parent: title,
			touchable: true,
			local: true,
		});

		const labelButton = new g.Label({
			scene: scene,
			font: font,
			y: 10,
			width: 200,
			text: "参加",
			fontSize: 50,
			textColor: "black",
			textAlign: "center",
			widthAutoAdjust: false,
			parent: button,
		});

		// 開始ボタン
		const buttonStart = new g.FilledRect({
			scene: scene,
			x: (g.game.width - 200) / 2 + 300,
			y: (g.game.height - 80) / 2,
			width: 200,
			height: 80,
			cssColor: "yellow",
			parent: title,
			touchable: true,
			local: true,
		});
		buttonStart.hide();

		new g.Label({
			scene: scene,
			font: font,
			y: 10,
			width: 200,
			text: "開始",
			fontSize: 50,
			textColor: "black",
			textAlign: "center",
			widthAutoAdjust: false,
			parent: buttonStart,
		});

		const gameBase = new g.E({
			scene: scene,
			parent: scene,
		});
		gameBase.hide();

		const mapBase = new g.E({
			scene: scene,
			x: g.game.width / 2,
			y: g.game.height / 2 + 250,
			width: 0,
			height: 0,
			anchorX: 0,
			anchorY: 0,
			scaleY: 1.0,
			scaleX: 7.5,
			parent: gameBase,
		});

		const floor = new g.FilledRect({
			scene: scene,
			x: 0,
			y: 0,
			width: 2000,
			height: 2000,
			anchorX: 0.5,
			anchorY: 0.5,
			angle: 0,
			cssColor:"gray",
			parent: mapBase,
		});

		const maps: g.FilledRect[][] = [];
		for (let y = 0; y < 20; y++) {
			maps[y] = [];
			for (let x = 0; x < 20; x++) {
				maps[y].push(
					new g.FilledRect({
						scene: scene,
						x: x * 100,
						y: y * 100,
						width: 100 - 2,
						height: 100 - 2,
						cssColor: "white",
						parent: floor,
					})
				);
			}
		}

		// ユニット配置用
		const unitBase = new g.E({
			scene: scene,
			parent: gameBase,
		});

		floor.onUpdate.add(() => {
			// floor.angle += 0.3;
			// floor.modified();
		});

		// 参加人数表示
		const labelCount = new g.Label({
			scene: scene,
			font: font,
			y: -60,
			width: 200,
			text: "0人",
			fontSize: 50,
			textColor: "black",
			textAlign: "center",
			widthAutoAdjust: false,
			parent: button,
		});

		// 参加
		button.onPointDown.add((e) => {
			button.touchable = false;
			labelButton.text = "参加済み";
			labelButton.invalidate();

			focus(); //フォーカス

			g.game.raiseEvent(new g.MessageEvent({ playerId: e.player.id }));

			//キーボードイベント
			document.addEventListener("keydown", (ev) => {
				ev.preventDefault();
				//label.text = ev.key;
				//label.invalidate();

				g.game.raiseEvent(new g.MessageEvent({ isPush: true, key: ev.key, pId: e.player.id }));
			});

			document.addEventListener("keyup", (ev) => {
				ev.preventDefault();
				g.game.raiseEvent(new g.MessageEvent({ isPush: false, key: ev.key, pId: e.player.id }));
			});
		});

		// 開始
		buttonStart.onPointDown.add(() => {
			g.game.raiseEvent(new g.MessageEvent({ name: "start" }));
		});

		//キーイベントを受け取る
		scene.onMessage.add(function (msg) {
			// 関係ないイベントは無視して抜ける
			if (!msg.data) return;

			const ev = msg.data;

			if (ev.name == "start") {
				title.hide();
				gameBase.show();
			}

			//参加ボタンを押したとき
			if (ev.playerId) {
				const player = new Player(floor, unitBase);

				players[ev.playerId] = player;

				labelCount.text = "" + Object.keys(players).length + "人";
				labelCount.invalidate();
			}

			//矢印キーを押したとき
			if (ev.key) {
				const player = players[ev.pId];
				if (ev.isPush) {
					// 移動速度を設定
					if (ev.key == "ArrowUp") {
						player.speed = -10;
					}
					if (ev.key == "ArrowDown") {
						player.speed = 10;
					}
					if (ev.key == "ArrowRight") {
						player.rotate = 2;
					}
					if (ev.key == "ArrowLeft") {
						player.rotate = -2;
					}
				} else {
					// 移動速度を0にする
					if (ev.key == "ArrowUp") {
						player.speed = 0;
					}
					if (ev.key == "ArrowDown") {
						player.speed = 0;
					}
					if (ev.key == "ArrowRight") {
						player.rotate = 0;
					}
					if (ev.key == "ArrowLeft") {
						player.rotate = 0;
					}

					if (ev.key == "a" || ev.key == "A") {
						player.setColor();
					}
				}
			}
		});

		scene.onUpdate.add(() => {
			if (!buttonStart.visible()) {
				if (gameMasterId === g.game.selfId) {
					buttonStart.show();
				}
			}

			for (const key in players) {
				const player = players[key];
				player.move(key, maps);
			}

			//重ね順ソート
			unitBase.children?.sort((a, b) => a.y - b.y);
		});
	});
	g.game.pushScene(scene);
}

//プレイヤークラス
class Player {
	public speed = 0;
	public rotate = 0; //回転速度
	public angle = 45; //角度
	public numColor = 0;
	private colors = ["pink", "green", "yellow", "blue"];

	constructor(private rectFloor: g.FilledRect, private rectMain: g.E) {
		this.base.x = rectFloor.width / 2;
		this.base.y = rectFloor.height / 2;
	}

	public base = new g.FilledRect({
		scene: g.game.scene(),
		width: 30,
		height: 30,
		anchorX: 0.5,
		anchorY: 0.5,
		cssColor: "black",
		opacity: 0.2,
		parent: this.rectFloor,
	});

	public unit = new g.FrameSprite({
		scene: g.game.scene(),
		width: 187.5,
		height: 250,
		anchorX: 0.5,
		anchorY: 1.0,
		src:g.game.scene().asset.getImageById("kaeru"),
		frames:[0,1,2,3,4,5,6,7,8],
		parent: this.rectMain,
	});

	public move(key: string, maps: g.FilledRect[][]) {
		this.angle += this.rotate;
		const moveX = this.speed * Math.cos(this.angle * (Math.PI / 180));
		const moveY = this.speed * Math.sin(this.angle * (Math.PI / 180));
		this.base.x += moveX;
		this.base.y += moveY;
		this.base.x = Math.max(5, Math.min(this.base.x, this.rectFloor.width - 5));
		this.base.y = Math.max(5, Math.min(this.base.y, this.rectFloor.height - 5));
		this.base.modified();

		if (key == g.game.selfId) {
			this.rectFloor.anchorX = this.base.x / this.rectFloor.width;
			this.rectFloor.anchorY = this.base.y / this.rectFloor.height;
			this.rectFloor.angle = -this.angle + 90;
			this.rectFloor.modified();
		}

		const gp = this.rectFloor.localToGlobal(this.base);
		this.unit.x = gp.x;
		this.unit.y = gp.y;
		this.unit.modified();

		//床を塗る
		if (this.speed != 0) {
			const mx = Math.floor(this.base.x / 100);
			const my = Math.floor(this.base.y / 100);
			const map = maps[my][mx];
			map.cssColor = this.colors[this.numColor];
			map.modified();
		}
	}

	public setColor() {
		this.numColor = (this.numColor + 1) % 4;
		//this.unit.cssColor = this.colors[this.numColor];
		//this.unit.modified();
	}
}
