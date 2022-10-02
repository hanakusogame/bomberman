import tl = require("@akashic-extension/akashic-timeline");
import { resolvePlayerInfo } from "@akashic-extension/resolve-player-info";
import { Player } from "./Player";

//参加待ち画面
export class Title extends g.E {
	public start: (playerIds: g.Player[]) => void = () => {};
	constructor() {
		const scene = g.game.scene();

		

		super({
			scene: scene,
			parent: scene,
		});

		const playerIds: g.Player[] = [];

		const title = new g.Sprite({
			scene: scene,
			x: 123,
			width: 1034,
			height: 720,
			src: scene.asset.getImageById("title"),
			parent: this,
		});

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 50,
		});

		const label = new g.Label({
			scene: scene,
			font: font,
			text: "キーボード　↑:前進　↓:後退　←→:回転",
			fontSize: 30,
			textColor: "yellow",
			parent: this,
		});

		new g.Label({
			scene: scene,
			x: 40,
			y: 180,
			font: font,
			text: "カエルトゥーン",
			fontSize: 80,
			textColor: "white",
			parent: title,
		});

		let players: { [key: string]: Player } = {};

		// 参加ボタン
		const button = new g.FilledRect({
			scene: scene,
			x: 100,
			y: 400,
			width: 200,
			height: 80,
			cssColor: "white",
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
			x: 350,
			y: 400,
			width: 200,
			height: 80,
			cssColor: "white",
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

		// 参加人数表示
		const labelCount = new g.Label({
			scene: scene,
			font: font,
			y: -60,
			width: 200,
			text: "0人",
			fontSize: 50,
			textColor: "white",
			textAlign: "center",
			widthAutoAdjust: false,
			parent: button,
		});

		//ユーザーネーム取得ダイアログからの操作
		g.game.onPlayerInfo.add((ev) => {
			playerIds.push(ev.player);
			labelCount.text = playerIds.length + "人";
			labelCount.invalidate();
		});

		// 参加
		button.onPointDown.add((e) => {
			resolvePlayerInfo({ raises: true });

			button.touchable = false;
			labelButton.text = "参加済み";
			labelButton.invalidate();

			//キーボードイベント設定
			document.addEventListener("keydown", (ev) => {
				ev.preventDefault();
				g.game.raiseEvent(new g.MessageEvent({ isPush: true, key: ev.key }));
			});

			document.addEventListener("keyup", (ev) => {
				ev.preventDefault();
				g.game.raiseEvent(new g.MessageEvent({ isPush: false, key: ev.key }));
			});

			focus(); //フォーカス
		});

		// 開始
		buttonStart.onPointDown.add(() => {
			g.game.raiseEvent(new g.MessageEvent({ name: "start" }));
		});

		//キーイベントを受け取る
		scene.onMessage.add((msg: g.MessageEvent) => {
			// 関係ないイベントは無視して抜ける
			if (!msg.data) return;

			//参加ボタンを押したとき
			if (msg.data.name == "join") {
				playerIds.push(msg.player);
				labelCount.text = playerIds.length + "人";
				labelCount.invalidate();
			}

			//開始ボタンを押したとき
			if (msg.data.name == "start") {
				this.start(playerIds);
			}
		});

		this.onUpdate.add(() => {
			//放送者の場合、開始ボタンを表示
			if (!buttonStart.visible()) {
				if (g.game.vars.gameMasterId === g.game.selfId) {
					buttonStart.show();
				}
			}
		});
	}
}
