import { E, Font, PointMoveEvent, PointUpEvent } from "@akashic/akashic-engine";
import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject";

declare const window: RPGAtsumaruWindow;

export function main(param: GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["player", "shot", "se"],
	});
	let time = 60; // 制限時間
	if (param.sessionParameter.totalTimeLimit) {
		time = param.sessionParameter.totalTimeLimit; // セッションパラメータで制限時間が指定されたらその値を使用します
	}
	// 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
	g.game.vars.gameState = { score: 0 };
	scene.onLoad.add(() => {
		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 50,
		});

		const label = new g.Label({
			scene: scene,
			font: font,
			text: "Hello World!",
			fontSize: 50,
			textColor: "black",
			parent: scene,
			local: true,
		});

		let players: { [key: string]: Player } = {};

		const button = new g.FilledRect({
			scene: scene,
			x: g.game.width - 60,
			y: 10,
			width: 50,
			height: 50,
			cssColor: "yellow",
			parent: scene,
			touchable: true,
			local: true,
		});

		button.onPointDown.add((e) => {
			button.hide();

			focus(); //フォーカス

			g.game.raiseEvent(new g.MessageEvent({ playerId: e.player.id }));

			//キーボードイベント
			document.addEventListener("keydown", (ev) => {
				ev.preventDefault();
				label.text = ev.key;
				label.invalidate();

				g.game.raiseEvent(new g.MessageEvent({ isPush: true, key: ev.key, pId: e.player.id }));
			});

			document.addEventListener("keyup", (ev) => {
				ev.preventDefault();
				g.game.raiseEvent(new g.MessageEvent({ isPush: false, key: ev.key, pId: e.player.id }));
			});
		});

		//キーイベントを受け取る
		scene.onMessage.add(function (msg) {
			// 関係ないイベントは無視して抜ける
			if (!msg.data) return;

			const ev = msg.data;

			if (ev.playerId) {
				const player = new Player({
					scene: scene,
					x: (g.game.width - 50) / 2,
					y: (g.game.height - 50) / 2,
					width: 50,
					height: 50,
					cssColor: "blue",
					parent: scene,
				});
				players[ev.playerId] = player;
			}

			if (ev.key) {
				const player = players[ev.pId];
				if (ev.isPush) {
					if (ev.key == "a" || ev.key == "A") {
						player.cssColor = player.cssColor == "green" ? "blue" : "green";
					}
					if (ev.key == "ArrowUp") {
						player.moveY = -5;
					}
					if (ev.key == "ArrowDown") {
						player.moveY = 5;
					}
					if (ev.key == "ArrowRight") {
						player.moveX = 5;
					}
					if (ev.key == "ArrowLeft") {
						player.moveX = -5;
					}
				}else{
					if (ev.key == "ArrowUp") {
						player.moveY = 0;
					}
					if (ev.key == "ArrowDown") {
						player.moveY = 0;
					}
					if (ev.key == "ArrowRight") {
						player.moveX = 0;
					}
					if (ev.key == "ArrowLeft") {
						player.moveX = 0;
					}
				}
			}
		});

		scene.onUpdate.add(() => {
			for (const key in players) {
				const player = players[key];
				player.x += player.moveX;
				player.y += player.moveY;
				player.modified();
			}
		});
	});
	g.game.pushScene(scene);
}

//プレイヤークラス
class Player extends g.FilledRect {
	public moveX = 0;
	public moveY = 0;
}
