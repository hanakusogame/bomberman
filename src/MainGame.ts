import { Player } from "./Player";
import tl = require("@akashic-extension/akashic-timeline");

export class MainGame extends g.E {
	public init: (playerIds: g.Player[]) => void = (pid) => {};
	private colors = ["#ff5050", "green", "yellow", "blue"];

	constructor() {
		const scene = g.game.scene();
		super({
			scene: scene,
			width: g.game.width,
			height: g.game.height,
			touchable: true,
		});
		let players: { [key: string]: Player } = {};
		let gameState = "start";

		// マップの親(スケールのxとyを伸縮させて疑似的に奥行きを表現)
		const mapBase = new g.E({
			scene: scene,
			x: g.game.width / 2,
			y: g.game.height / 2 + 250,
			width: 0,
			height: 0,
			anchorX: 0,
			anchorY: 0,
			scaleY: 0.8,
			scaleX: 5.0,
			parent: this,
		});

		//床
		const floor = new g.FilledRect({
			scene: scene,
			x: 0,
			y: 0,
			width: 2000,
			height: 2000,
			anchorX: 0.5,
			anchorY: 0.5,
			angle: 0,
			cssColor: "gray",
			parent: mapBase,
		});

		//マップチップ
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
						tag: -1,
					})
				);
			}
		}

		// ユニット配置用
		const unitBase = new g.E({
			scene: scene,
			parent: this,
		});

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 50,
		});

		// 上で生成した font.png と font_glyphs.json に対応するアセットを取得
		const fontAsset = g.game.scene().asset.getImageById("number");
		const fontGlyphAsset = g.game.scene().asset.getTextById("glyph");

		// テキストアセット (JSON) の内容をオブジェクトに変換
		const glyphInfo = JSON.parse(fontGlyphAsset.data);

		// ビットマップフォントを生成
		const fontNum = new g.BitmapFont({
			src: fontAsset,
			glyphInfo: glyphInfo,
		});

		//残り時間表示
		new g.Sprite({
			scene: scene,
			src: g.game.scene().asset.getImageById("time"),
			x: 500,
			y: 25,
			parent: this,
		});

		let timeLimit = 90;
		const labelTime = new g.Label({
			scene: scene,
			x: 600,
			y: 30,
			font: fontNum,
			text: "90",
			parent: this,
		});

		//マップの色ごとの数表示用
		const numColor = 4;
		const labelColors: g.Label[] = [];
		for (let i = 0; i < numColor; i++) {
			const rect = new g.FilledRect({
				scene: scene,
				x: 1000,
				y: 150 * i + 50,
				width: 80,
				height: 80,
				cssColor: this.colors[i],
				parent: this,
			});

			labelColors.push(
				new g.Label({
					scene: scene,
					x: 90,
					y: 10,
					font: fontNum,
					text: "0",
					parent: rect,
				})
			);
		}

		//スタート表示用
		const startBase = new g.E({
			scene:scene,
			parent:this,
		})

		const rectStart = new g.FilledRect({
			scene:scene,
			width:g.game.width,
			height:g.game.height,
			cssColor:"black",
			opacity:0.5,
			parent:startBase
		})

		const sprStart = new g.FrameSprite({
			scene:scene,
			src:scene.asset.getImageById("start"),
			x:(g.game.width-800)/2,
			y:(g.game.height-250)/2,
			width:800,
			height:250,
			frameNumber:0,
			frames:[0,1],
			parent:startBase
		})

		// デバッグ用文字列
		const debugText = new g.Label({
			scene: scene,
			y: g.game.height - 50,
			font: font,
			text: "",
			textColor: "red",
			parent: this,
		});

		floor.onUpdate.add(() => {
			// floor.angle += 0.3;
			// floor.modified();
		});

		//キーイベントを受け取る
		this.onMessage.add((msg) => {
			if (gameState != "play") return;

			// 関係ないイベントは無視して抜ける
			if (!msg.data) return;

			const ev = msg.data;

			//矢印キーを押したとき
			if (ev.key) {
				const player = players[msg.player.id];
				if (!player) return;

				if (ev.isPush) {
					// 移動速度を設定
					if (ev.key == "ArrowUp") {
						player.speed = 10;
					}
					if (ev.key == "ArrowDown") {
						player.speed = -10;
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

					// if (ev.key == "a" || ev.key == "A") {
					// 	player.setColor();
					// }
				}
			}
		});

		this.onPointMove.add((ev) => {
			if (gameState != "play") return;
			const player = players[ev.player.id];
			if (player) {
				const px = ev.point.x + ev.startDelta.x;
				const py = ev.point.y + ev.startDelta.y;
				if (py < (this.height / 3) * 2) {
					player.speed = 10;
				} else {
					player.speed = -10;
				}
				if (px < this.width / 3) {
					player.rotate = -2;
				} else if (px > (this.width / 3) * 2) {
					player.rotate = 2;
				} else {
					player.rotate = 0;
				}
			}
		});

		this.onPointUp.add((ev) => {
			if (gameState != "play") return;
			const player = players[ev.player.id];
			if (player) {
				player.speed = 0;
				player.rotate = 0;
			}
		});

		const move = () => {
			//移動
			for (const key in players) {
				const player = players[key];
				player.move();

				//床を塗る
				if (player.speed != 0) {
					const mx = Math.floor(player.base.x / 100);
					const my = Math.floor(player.base.y / 100);
					const map = maps[my][mx];
					map.cssColor = this.colors[player.numColor];
					map.modified();
					map.tag = player.numColor;
				}
			}

			//視点移動
			let player = players[g.game.selfId];
			if (!player) player = players[g.game.vars.gameMasterId];

			floor.anchorX = player.base.x / floor.width;
			floor.anchorY = player.base.y / floor.height;
			floor.angle = -player.angle - 90;
			floor.modified();

			if (player.speed > 0) {
				if (player.rotate == 0) {
					player.unit.frameNumber = 4;
				} else if (player.rotate > 0) {
					player.unit.frameNumber = 5;
				} else if (player.rotate < 0) {
					player.unit.frameNumber = 3;
				}
			} else if (player.speed < 0) {
				if (player.rotate == 0) {
					player.unit.frameNumber = 0;
				} else if (player.rotate > 0) {
					player.unit.frameNumber = 7;
				} else if (player.rotate < 0) {
					player.unit.frameNumber = 1;
				}
			}
			player.unit.modified();

			//重ね順ソート
			unitBase.children?.sort((a, b) => a.y - b.y);
		};

		this.onUpdate.add(() => {

			if(gameState != "play") return; 

			//残り時間を更新
			timeLimit -= 1 / 30;
			labelTime.text = "" + Math.max(0, Math.floor(timeLimit));
			labelTime.invalidate();
			if (0 >= Math.ceil(timeLimit)) {
				gameState = "finish";
			}

			move();

			//マップの色数を数える
			const colorCnt = [0, 0, 0, 0, 0];
			for (let y = 0; y < maps.length; y++) {
				for (let x = 0; x < maps[y].length; x++) {
					if (maps[y][x].tag != -1) {
						colorCnt[maps[y][x].tag]++;
					}
				}
			}
			for (let i = 0; i < numColor; i++) {
				labelColors[i].text = "" + colorCnt[i];
				labelColors[i].invalidate();
			}
		});

		//初期化
		this.init = (playerIds) => {
			for (let i = 0; i < playerIds.length; i++) {
				const player = new Player(floor, unitBase, i, playerIds[i].name);
				player.numColor = i % numColor;
				players[playerIds[i].id] = player;
			}

			move();

			scene.setTimeout(() => {
				startBase.remove();
				gameState = "play";
			}, 3000);
		};
	}
}
