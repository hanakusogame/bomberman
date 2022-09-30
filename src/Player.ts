//プレイヤークラス
export class Player {
	private static font: g.Font;
	public speed = 0;
	public rotate = 0; //回転速度
	public angle = 45; //角度
	public numColor = 0;
	public base: g.FilledRect;
	public unit: g.FrameSprite;

	constructor(private rectFloor: g.FilledRect, private rectMain: g.E, num: number, name: string) {
		if(!Player.font){
			Player.font = new g.DynamicFont({
				game: g.game,
				fontFamily: "sans-serif",
				size: 25,
			});
		}
		
		this.base = new g.FilledRect({
			scene: g.game.scene(),
			x: rectFloor.width / 2 + num * 30,
			y: rectFloor.height / 2,
			width: 30,
			height: 30,
			anchorX: 0.5,
			anchorY: 0.5,
			cssColor: "black",
			opacity: 0.2,
			parent: this.rectFloor,
		});

		this.unit = new g.FrameSprite({
			scene: g.game.scene(),
			width: 187.5,
			height: 250,
			anchorX: 0.5,
			anchorY: 0.85,
			scaleX: 1.3,
			scaleY: 1.3,
			src: g.game.scene().asset.getImageById("kaeru"),
			frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
			parent: this.rectMain,
		});

		new g.Label({
			scene: g.game.scene(),
			x:this.unit.width/2,
			width:500,
			anchorX:0.5,
			anchorY:0.5,
			font: Player.font,
			fontSize: 25,
			textAlign:"center",
			widthAutoAdjust:false,
			text: name,
			parent: this.unit,
		});
	}

	public move() {
		if (this.speed >= 0) {
			this.angle += this.rotate;
		} else {
			this.angle -= this.rotate;
		}
		const moveX = this.speed * Math.cos(this.angle * (Math.PI / 180));
		const moveY = this.speed * Math.sin(this.angle * (Math.PI / 180));
		this.base.x += moveX;
		this.base.y += moveY;
		this.base.x = Math.max(5, Math.min(this.base.x, this.rectFloor.width - 5));
		this.base.y = Math.max(5, Math.min(this.base.y, this.rectFloor.height - 5));
		this.base.modified();

		//カエルの位置を変更し表示
		const gp = this.rectFloor.localToGlobal(this.base);
		this.unit.x = gp.x;
		this.unit.y = gp.y;
		this.unit.modified();
	}

	public setColor() {
		this.numColor = (this.numColor + 1) % 4;
		//this.unit.cssColor = this.colors[this.numColor];
		//this.unit.modified();
	}
}
