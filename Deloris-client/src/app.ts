class SimpleGame {

    constructor() {
        this.game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio,
            Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }

    game: Phaser.Game;
    iso: Phaser.Plugin.Isometric;
    scene: Scene;

    preload() {
        this.scene = new Scene(this.game);
        this.game.time.advancedTiming = true;
        this.game.debug.renderShadow = false;
        this.game.stage.disableVisibilityChange = true;

        this.iso = new Phaser.Plugin.Isometric(this.game);
        this.scene.isoArcade = new Phaser.Plugin.Isometric.Arcade(this.game);

        this.game.plugins.add(this.iso);

        this.game.load.atlasJSONHash('tileset', 'assets/tileset.png', 'assets/tileset.json');

        this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        this.iso.projector.anchor.setTo(0.5, 0.1);

        this.scene.iso = this.iso;

        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN
        ]);
    }

    create() {
        this.scene.createScene();
    }

    update() {
        this.scene.updateWater();

        this.scene.handleInput();
    }

    render() {
        //this.isoGroup.forEach(tile => {
        //    this.game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
        //}, null);
        this.game.debug.text(this.game.time.fps.toString() || '--', 2, 14, "#a7aebe");
    }
}

class Scene {
    game: Phaser.Game;
    isoArcade: Phaser.Plugin.Isometric.Arcade;
    water: Phaser.Plugin.Isometric.IsoSprite[];
    isoGroup: Phaser.Group;
    players: Phaser.Plugin.Isometric.IsoSprite[];
    iso: Phaser.Plugin.Isometric;
    network: NetworkManager;
    playerIndex: number;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    createScene() {
        this.isoGroup = this.game.add.group();

        this.isoGroup.enableBody = true;
        this.isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;

        var tileArray = [];
        tileArray[0] = 'water';
        tileArray[1] = 'sand';
        tileArray[2] = 'grass';
        tileArray[3] = 'stone';
        tileArray[4] = 'wood';
        tileArray[5] = 'watersand';
        tileArray[6] = 'grasssand';
        tileArray[7] = 'sandstone';
        tileArray[8] = 'bush1';
        tileArray[9] = 'bush2';
        tileArray[10] = 'mushroom';
        tileArray[11] = 'wall';
        tileArray[12] = 'window';

        var tiles = [
            9, 2, 1, 1, 4, 4, 1, 6, 2, 10, 2,
            2, 6, 1, 0, 4, 4, 0, 0, 2, 2, 2,
            6, 1, 0, 0, 4, 4, 0, 0, 8, 8, 2,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 9, 2,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
            11, 11, 12, 11, 3, 3, 11, 12, 11, 11, 11,
            3, 7, 3, 3, 3, 3, 3, 3, 7, 3, 3,
            7, 1, 7, 7, 3, 3, 7, 7, 1, 1, 7
        ];

        var size = 32;

        var i = 0;
        this.water = [];
        var tile: Phaser.Plugin.Isometric.IsoSprite;
        for (var y = size; y <= this.isoArcade.bounds.frontY - size; y += size) {
            for (var x = size; x <= this.isoArcade.bounds.frontX - size; x += size) {
                tile = <Phaser.Plugin.Isometric.IsoSprite>this.iso.addIsoSprite(x, y, 0, 'tileset', tileArray[tiles[i]], this.isoGroup);
                tile.anchor.set(0.5, 1);
                tile.smoothed = false;
                tile.body.moves = false;
                if (tiles[i] === 4) {
                    tile.isoZ += 6;
                }
                if (tiles[i] <= 10 && (tiles[i] < 5 || tiles[i] > 6)) {
                    tile.scale.x = this.game.rnd.pick([-1, 1]);
                }
                if (tiles[i] === 0) {
                    this.water.push(tile);
                }
                i++;
            }
        }


        this.playerIndex = this.game.rnd.pick([0, 1, 2]);
        alert("PlayerID: " + this.playerIndex);
        this.network = new NetworkManager(this);

        var prevPosX = -1;
        var prevPosY = -1;
        window.setInterval(() => {
            var curX = Math.floor(this.players[this.playerIndex].body.x / 32);
            var curY = Math.floor(this.players[this.playerIndex].body.y / 32);
            var needSend = false;
            if (prevPosX !== curX) {
                needSend = true;
                prevPosX = curX;
            }

            if (prevPosY !== curY) {
                needSend = true;
                prevPosY = curY;
            }

            if (needSend) this.network.sendMove(this.playerIndex, curX, curY);
        }, 1000);
    }

    updateWater() {
        this.water.forEach(w => {
            w.isoZ = (-2 * Math.sin((this.game.time.now + (w.isoX * 7)) * 0.004)) + (-1 * Math.sin((this.game.time.now + (w.isoY * 8)) * 0.005));
            w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.1), 0.2, 1);
        });
    }

    addPlayers(players: any) {
        if (this.players) return;

        this.players = [];
        players.forEach(player => {
            var tile = <Phaser.Plugin.Isometric.IsoSprite>this.iso.addIsoSprite(player.x*32, player.y*32, 0, 'tileset', "mushroom", this.isoGroup);
            tile.anchor.set(0.5, 1);
            tile.body.collideWorldBounds = true;
            this.players.push(tile);
        });
    }

    updatePlayers(players: any) {
        var i = 0;
        players.forEach(player => {
            if (i !== this.playerIndex) {
                console.log("update for player=" + i);
                var curPlayer = this.players[i];
                curPlayer.isoX = player.x*32;
                curPlayer.isoY = player.y*32;
            }
            i++;
        });
    }

    handleInput() {
        if (!this.players) return;
        var body = this.players[this.playerIndex].body;

        var speedPxPerSec = 2*32;
        var isLeft = this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT);
        var isRight = this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
        var isTop = this.game.input.keyboard.isDown(Phaser.Keyboard.UP);
        var isBottom = this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN);

        if (isLeft && isRight || (!isLeft && !isRight)) {
            body.velocity.x = 0;
        }

        if (isLeft) {
            body.velocity.x = -speedPxPerSec;
        } else if (isRight) {
            body.velocity.x = speedPxPerSec;
        }

        if (isTop && isBottom || (!isTop && !isBottom)) {
            body.velocity.y = 0;
        }

        if (isTop) {
            body.velocity.y = -speedPxPerSec;
        } else if (isBottom) {
            body.velocity.y = speedPxPerSec;
        }
    }
}

window.onload = () => {
    var game = new SimpleGame();
};