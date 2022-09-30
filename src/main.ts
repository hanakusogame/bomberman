import { AssetManager, E, Font, PointMoveEvent, PointUpEvent } from "@akashic/akashic-engine";
import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject";
import { Player } from "./Player";
import { Title } from "./Title";
import { MainGame } from "./MainGame";


declare const window: RPGAtsumaruWindow;

export function main(param: GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["kaeru", "title","start","time","number","glyph"],
	});

	// 放送者を区別する
	g.game.vars.gameMasterId = null;
	g.game.onJoin.addOnce((e) => {
		g.game.vars.gameMasterId = e.player.id;
	});

	// 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
	g.game.vars.gameState = { score: 0 };
	scene.onLoad.add(() => {
		// 背景
		const bg = new g.FilledRect({
			scene: scene,
			width: g.game.width,
			height: g.game.height,
			cssColor: "black",
			opacity: 0.5,
			parent: scene,
		});

		const title = new Title();

		title.start = (playerIds)=>{
			title.remove();
			const mainGame = new MainGame();
			scene.append(mainGame);
			mainGame.init(playerIds);
		};
	});
	g.game.pushScene(scene);
}


