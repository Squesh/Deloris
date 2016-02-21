var Scene = (function () {
    function Scene() {
    }
    Scene.prototype.createScene = function () {
        this.isoGroup = SimpleGame.game.add.group();
        this.sortGroup = SimpleGame.game.add.group();
        this.isoGroup.enableBody = true;
        //this.isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;
        this.cursorPosition = new Phaser.Plugin.Isometric.Point3();
        //SimpleGame.resizeToMapSize(512, 512);
        var tiles = [];
        var mapSize = { width: 16, height: 16 };
        for (var i = 0; i < mapSize.width; i++) {
            tiles[i] = [];
            for (var j = 0; j < mapSize.height; j++) {
                tiles[i][j] = (Math.sin(Math.pow(i + j * Math.tan(4), 2)) * Math.tan(i * j * 126)) % 3 > 0 ? 0 : 1;
            }
        }
        this.map = new Map(tiles);
        this.map.drawMap();
        this.runNetwork();
        SimpleGame.game.input.onDown.add(this.onLeftMouseClick, this);
    };
    Scene.prototype.runNetwork = function () {
        //this.network = new NetworkManager(this);
        //this.network.actionOnConnection = () => this.network.registerPlayer("Test");
        //return;
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
    Scene.prototype.addPlayers = function (players) {
        var _this = this;
        if (!this.players)
            this.players = [];
        players.forEach(function (player) {
            var tPlayer = _this.players.filter(function (p) { return p.token === player.token; })[0];
            if (!tPlayer) {
                var newPlayer = new Player(_this.isoGroup, _this.sortGroup, player);
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
                    tPlayer.hero.move(_this.map.cellAt(player.x, player.y));
            }
        });
    };
    Scene.prototype.update = function () {
        this.handleMouse();
        //this.isoGroup.forEach(tile => {
        //    SimpleGame.game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
        //}, this);
    };
    Scene.prototype.handleMouse = function () {
        SimpleGame.iso.projector.unproject(SimpleGame.game.input.activePointer.position, this.cursorPosition);
    };
    Scene.prototype.onLeftMouseClick = function () {
        var mapCellOverMouse = this.map.cellsAtScreenCoords(this.cursorPosition.x, this.cursorPosition.y);
        if (mapCellOverMouse) {
            if (this.curPlayer.hero.move(mapCellOverMouse)) {
                this.network.sendHeroMove(this.curPlayer, mapCellOverMouse.pos);
            }
        }
    };
    Scene.prototype.setCurrentPlayer = function (parsedPlayer) {
        if (!this.players)
            this.players = [];
        this.curPlayer = new Player(this.isoGroup, this.sortGroup, parsedPlayer);
        this.players.push(this.curPlayer);
    };
    return Scene;
})();
var Player = (function () {
    function Player(isoGroup, sortGroup, player) {
        this.token = player.token;
        this.name = player.name;
        this.isoGroup = isoGroup; // todo: drawer responsibility, not player
        this.hero = new Hero(isoGroup, SimpleGame.scene.map.cellAt(player.x, player.y));
        sortGroup.add(this.hero.drawable.sprite);
    }
    Player.prototype.removeHero = function () {
        this.isoGroup.remove(this.hero.drawable.sprite, true);
        this.sortGroup.remove(this.hero.drawable.sprite, true);
    };
    return Player;
})();
var Hero = (function () {
    function Hero(isoGroup, onCell) {
        this.speed = 350; // px per second
        if (!onCell)
            onCell = SimpleGame.scene.map.cellAt(0, 0);
        this.drawable = new DrawableObject(onCell.pos.x, onCell.pos.y, null, isoGroup, true, "peoples");
        this.drawable.sprite.resetFrame();
        this.walkAnimation = this.drawable.sprite.animations.add('walk');
        this.drawable.sprite.anchor.set(0.5, 0.5);
        this.onCell = onCell;
        //this.object.sprite.body.collideWorldBounds = true;
    }
    Hero.prototype.move = function (cell) {
        var _this = this;
        if (!cell || cell.isWall || this.onCell === cell)
            return false;
        var path = SimpleGame.scene.map.getPathToCellFromPoint(this.drawable.getScreenPos(), cell);
        if (!path || path.length === 0)
            return false;
        if (this.lastWalkTween) {
            SimpleGame.game.tweens.remove(this.lastWalkTween);
        }
        this.isWalking = true;
        this.walkAnimation.play(10, true);
        var curPos;
        var prevPos = this.drawable.getScreenPos();
        var tween = SimpleGame.game.add.tween(this.drawable.sprite);
        for (var i = 0; i < path.length; i++) {
            var targetCell = SimpleGame.scene.map.cellAt(path[i].pos.x, path[i].pos.y);
            curPos = targetCell.drawable.getScreenPos();
            var timeForMove = Phaser.Point.distance(prevPos, curPos) / this.speed * 1000;
            tween.to({ isoX: curPos.x, isoY: curPos.y }, Math.round(timeForMove), "Linear", false);
            prevPos = curPos;
        }
        tween.onComplete.add(function () {
            _this.isWalking = false;
            _this.onCell = cell;
            _this.walkAnimation.stop(true);
            console.log("Movement done!");
        }, this);
        tween.start();
        this.lastWalkTween = tween;
        return true;
    };
    return Hero;
})();
var DrawableObject = (function () {
    function DrawableObject(x, y, textureName, isoGroup, isRelativeCoords, tileSet) {
        if (isRelativeCoords === void 0) { isRelativeCoords = false; }
        if (tileSet === void 0) { tileSet = "tileset"; }
        var targetX, targetY;
        if (isRelativeCoords) {
            targetX = x * DrawableObject.spriteSize;
            targetY = y * DrawableObject.spriteSize;
        }
        else {
            targetX = x;
            targetY = y;
        }
        this.sprite = SimpleGame.iso.addIsoSprite(targetX, targetY, 0, tileSet, textureName, isoGroup);
        this.sprite.anchor.set(0.5, 0);
    }
    DrawableObject.prototype.getScreenPos = function () {
        return new Phaser.Point(this.sprite.isoX, this.sprite.isoY);
    };
    DrawableObject.prototype.moveToCell = function (cell) {
        var cellPos = cell.drawable.getScreenPos();
        this.sprite.isoX = cellPos.x;
        this.sprite.isoY = cellPos.y;
    };
    DrawableObject.prototype.isIntersects = function (x, y) {
        return this.sprite.isoBounds.containsXY(x, y);
    };
    DrawableObject.spriteSize = 32;
    return DrawableObject;
})();
var MapCell = (function () {
    function MapCell(x, y, isWall, textureName, isoGroup) {
        this.isWall = isWall;
        this.pos = new Phaser.Point(x, y);
        this.drawable = new DrawableObject(x, y, textureName, isoGroup, true);
    }
    return MapCell;
})();
var Map = (function () {
    function Map(tileIndexes) {
        this.tileIndexes = tileIndexes;
        this.width = tileIndexes.length;
        this.height = tileIndexes[0].length;
        this.tileNamesArray = [];
        this.tileNamesArray[0] = 'water';
        this.tileNamesArray[1] = 'sand';
        this.tileNamesArray[2] = 'grass';
        this.tileNamesArray[3] = 'stone';
        this.tileNamesArray[4] = 'wood';
        this.tileNamesArray[5] = 'watersand';
        this.tileNamesArray[6] = 'grasssand';
        this.tileNamesArray[7] = 'sandstone';
        this.tileNamesArray[8] = 'wall';
        this.tileNamesArray[9] = 'window';
        this.tileNamesArray[10] = 'bush1';
        this.tileNamesArray[11] = 'bush2';
        this.tileNamesArray[12] = 'mushroom';
        this.tileNamesArray[13] = 'crab';
    }
    Map.prototype.cellAt = function (x, y) {
        if (x >= this.width || x < 0 || y >= this.height || y < 0) {
            return null;
        }
        return this.cells[x][y];
    };
    Map.prototype.getPathToCell = function (fromCell, toCell) {
        return astar.AStar.search(this.weightMap, fromCell.pos, toCell.pos, [], true);
    };
    Map.prototype.getPathToCellFromPoint = function (fromScreenPoint, toCell) {
        var cellAtPoint = this.cellsAtScreenCoords(fromScreenPoint.x, fromScreenPoint.y);
        if (cellAtPoint)
            return this.getPathToCell(cellAtPoint, toCell);
        return [];
    };
    Map.prototype.cellsAtScreenCoords = function (x, y, colorize) {
        if (colorize === void 0) { colorize = false; }
        var size = DrawableObject.spriteSize;
        var posX = Math.floor(x / size);
        var posY = Math.floor(y / size);
        return this.cellAt(posX, posY);
        //// colorize hovered cells
        //if (colorize) {
        //    if (inBounds) {
        //        cell.drawable.sprite.tint = 0xff0000;
        //    } else {
        //        cell.drawable.sprite.tint = 0xffffff;
        //    }
        //}
    };
    Map.prototype.drawMap = function () {
        this.weightMap = new Array(this.width);
        var isWall;
        this.cells = new Array(this.width);
        for (var i = 0; i < this.width; i++) {
            this.cells[i] = new Array(this.height);
            this.weightMap[i] = new Array(this.height);
            for (var j = 0; j < this.height; j++) {
                var tileIndex = this.tileIndexes[i][j];
                isWall = tileIndex === 0;
                var tile = new MapCell(i, j, isWall, this.tileNamesArray[tileIndex], SimpleGame.scene.isoGroup);
                if (tileIndex === 8 || tileIndex === 9)
                    SimpleGame.scene.sortGroup.add(tile.drawable.sprite);
                this.weightMap[i][j] = isWall ? 0 : 1;
                this.cells[i][j] = tile;
            }
        }
    };
    return Map;
})();
//# sourceMappingURL=scene.js.map