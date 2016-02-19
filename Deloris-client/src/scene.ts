class Scene {
    game: Phaser.Game;
    isoArcade: Phaser.Plugin.Isometric.Arcade;
    water: Phaser.Plugin.Isometric.IsoSprite[];
    isoGroup: Phaser.Group;
    players: Player[];
    iso: Phaser.Plugin.Isometric;
    network: NetworkManager;
    playerIndex: number;
    curPlayer: Player;

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

        var mapSize = { x: 11, y: 11 };

        var i = 0;
        this.water = [];
        var tile: Phaser.Plugin.Isometric.IsoSprite;

        var size = 32;
        var centerX = this.isoArcade.bounds.centerX;
        var centerY = this.isoArcade.bounds.centerY;
        //var startX = centerX - (mapSize.x * size / 2.0);
        //var startY = centerY - (mapSize.y * size / 2.0);
        var startX = 0;
        var startY = 0;
        var curX = startX, curY = startY;

        for (var y = 0; y < mapSize.y; y ++) {
            for (var x = 0; x < mapSize.x; x ++) {
                tile = <Phaser.Plugin.Isometric.IsoSprite>this.iso.addIsoSprite(curX, curY, 0, 'tileset', tileArray[tiles[i]], this.isoGroup);
                tile.anchor.set(0.5, 1);
                tile.smoothed = false;
                tile.body.moves = false;
                if (tiles[i] === 0) this.water.push(tile);

                curX += size;
                i++;
            }
            curX = startX;
            curY += size;
        }

        this.runNetwork();
    }

    runNetwork() {

        var options = <IBootstrapDialogOptions>{};
        options.title = "Enter your name";
        options.message = $('<input class="form-control" id="login-name" placeholder="Nickname"></input>');
        options.closeByBackdrop = false;
        options.closable = false;
        options.closeByKeyboard = false;
        options.size = "size-small";

        var btn = <IBootstrapDialogButton>{};
        btn.label = "Login";
        btn.cssClass = "btn-primary";
        btn.hotkey = 13; // Enter.
        btn.action = dialog => {
            var nickName = $("#login-name").val();
            if (nickName) {
                dialog.close();
                this.network = new NetworkManager(this);
                this.network.actionOnConnection = () => this.network.registerPlayer(nickName);
            }
        };
        options.buttons = [ btn ];
        BootstrapDialog.show(options);
    }

    updateWater() {
        this.water.forEach(w => {
            w.isoZ = (-2 * Math.sin((this.game.time.now + (w.isoX * 7)) * 0.004)) + (-1 * Math.sin((this.game.time.now + (w.isoY * 8)) * 0.005));
            w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.1), 0.2, 1);
        });
    }

    addPlayers(players: any) {
        if (!this.players) this.players = [];

        players.forEach(player => {
            var tPlayer = this.players.filter(p => p.token === player.token)[0];
            if (!tPlayer) {
                var newPlayer = new Player(this.iso, this.isoGroup, player);
                this.players.push(newPlayer);
            }
        });
    }

    updatePlayers(players: any) {
        players.forEach(player => {
            if (player.token !== this.curPlayer.token) {
                var tPlayer = this.players.filter(p => p.token === player.token)[0];
                if (tPlayer) tPlayer.hero.move(player.x, player.y);
            }
        });
    }

    handleInput() {
        if (!this.curPlayer) return;
        var body = this.curPlayer.hero.tile.body;

        var speedPxPerSec = 2 * 32;
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

    setCurrentPlayer(parsedPlayer) {
        if (!this.players) this.players = [];
        this.curPlayer = new Player(this.iso, this.isoGroup, parsedPlayer);
        this.players.push(this.curPlayer);
    }
}

class Player {
    token: string;
    name: string;
    hero: Hero;
    isoGroup: Phaser.Group;

    constructor(iso: Phaser.Plugin.Isometric, isoGroup: Phaser.Group, player: any) {
        this.token = player.token;
        this.name = player.name;
        this.isoGroup = isoGroup; // todo: drawer responsibility, not player

        this.hero = new Hero(iso, isoGroup);
    }

    removeHero() {
        this.isoGroup.remove(this.hero.tile, true);
    }
}

class Hero {
    x: number;
    y: number;
    tile: Phaser.Plugin.Isometric.IsoSprite;

    constructor(iso: Phaser.Plugin.Isometric, isoGroup: Phaser.Group) {
        this.tile = <Phaser.Plugin.Isometric.IsoSprite>iso.addIsoSprite(this.x, this.y, 0, 'tileset', "mushroom", isoGroup);
        this.tile.anchor.set(0.5, 1);
        this.tile.body.collideWorldBounds = true;
    }

    move(x: number, y: number) {
        this.tile.isoX = x;
        this.tile.isoY = y;
    }
}