var Scene = (function () {
    function Scene(game) {
        this.game = game;
    }
    Scene.prototype.createScene = function () {
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
        var tile;
        var size = 32;
        var centerX = this.isoArcade.bounds.centerX;
        var centerY = this.isoArcade.bounds.centerY;
        //var startX = centerX - (mapSize.x * size / 2.0);
        //var startY = centerY - (mapSize.y * size / 2.0);
        var startX = 0;
        var startY = 0;
        var curX = startX, curY = startY;
        for (var y = 0; y < mapSize.y; y++) {
            for (var x = 0; x < mapSize.x; x++) {
                tile = this.iso.addIsoSprite(curX, curY, 0, 'tileset', tileArray[tiles[i]], this.isoGroup);
                tile.anchor.set(0.5, 1);
                tile.smoothed = false;
                tile.body.moves = false;
                if (tiles[i] === 0)
                    this.water.push(tile);
                curX += size;
                i++;
            }
            curX = startX;
            curY += size;
        }
        this.runNetwork();
    };
    Scene.prototype.runNetwork = function () {
        var _this = this;
        var options = {};
        options.title = "Enter your name";
        options.message = $('<input class="form-control" id="login-name" placeholder="Nickname"></input>');
        options.closeByBackdrop = false;
        options.closable = false;
        options.closeByKeyboard = false;
        options.size = "size-small";
        var btn = {};
        btn.label = "Login";
        btn.cssClass = "btn-primary";
        btn.hotkey = 13; // Enter.
        btn.action = function (dialog) {
            var nickName = $("#login-name").val();
            if (nickName) {
                dialog.close();
                _this.network = new NetworkManager(_this);
                _this.network.actionOnConnection = function () { return _this.network.registerPlayer(nickName); };
            }
        };
        options.buttons = [btn];
        BootstrapDialog.show(options);
    };
    Scene.prototype.updateWater = function () {
        var _this = this;
        this.water.forEach(function (w) {
            w.isoZ = (-2 * Math.sin((_this.game.time.now + (w.isoX * 7)) * 0.004)) + (-1 * Math.sin((_this.game.time.now + (w.isoY * 8)) * 0.005));
            w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.1), 0.2, 1);
        });
    };
    Scene.prototype.addPlayers = function (players) {
        var _this = this;
        if (!this.players)
            this.players = [];
        players.forEach(function (player) {
            var tPlayer = _this.players.filter(function (p) { return p.token === player.token; })[0];
            if (!tPlayer) {
                var newPlayer = new Player(_this.iso, _this.isoGroup, player);
                _this.players.push(newPlayer);
            }
        });
    };
    Scene.prototype.updatePlayers = function (players) {
        var _this = this;
        players.forEach(function (player) {
            if (player.token !== _this.curPlayer.token) {
                var tPlayer = _this.players.filter(function (p) { return p.token === player.token; })[0];
                if (tPlayer)
                    tPlayer.hero.move(player.x, player.y);
            }
        });
    };
    Scene.prototype.handleInput = function () {
        if (!this.curPlayer)
            return;
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
        }
        else if (isRight) {
            body.velocity.x = speedPxPerSec;
        }
        if (isTop && isBottom || (!isTop && !isBottom)) {
            body.velocity.y = 0;
        }
        if (isTop) {
            body.velocity.y = -speedPxPerSec;
        }
        else if (isBottom) {
            body.velocity.y = speedPxPerSec;
        }
    };
    Scene.prototype.setCurrentPlayer = function (parsedPlayer) {
        if (!this.players)
            this.players = [];
        this.curPlayer = new Player(this.iso, this.isoGroup, parsedPlayer);
        this.players.push(this.curPlayer);
    };
    return Scene;
})();
var Player = (function () {
    function Player(iso, isoGroup, player) {
        this.token = player.token;
        this.name = player.name;
        this.isoGroup = isoGroup; // todo: drawer responsibility, not player
        this.hero = new Hero(iso, isoGroup);
    }
    Player.prototype.removeHero = function () {
        this.isoGroup.remove(this.hero.tile, true);
    };
    return Player;
})();
var Hero = (function () {
    function Hero(iso, isoGroup) {
        this.tile = iso.addIsoSprite(this.x, this.y, 0, 'tileset', "mushroom", isoGroup);
        this.tile.anchor.set(0.5, 1);
        this.tile.body.collideWorldBounds = true;
    }
    Hero.prototype.move = function (x, y) {
        this.tile.isoX = x;
        this.tile.isoY = y;
    };
    return Hero;
})();
//# sourceMappingURL=scene.js.map