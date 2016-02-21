class Scene {
    isoGroup: Phaser.Group;
    sortGroup: Phaser.Group;

    players: Player[];
    network: NetworkManager;
    playerIndex: number;
    curPlayer: Player;

    cursorPosition: Phaser.Plugin.Isometric.Point3;
    map: Map;

    createScene() {
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
                tiles[i][j] = (Math.sin(Math.pow(i + j * Math.tan(4), 2))*Math.tan(i*j*126)) % 3 > 0 ? 0 : 1;
            }
        }

        this.map = new Map(tiles);
        this.map.drawMap();

        this.runNetwork();

        SimpleGame.game.input.onDown.add(this.onLeftMouseClick, this);
    }

    runNetwork() {
        //this.network = new NetworkManager(this);
        //this.network.actionOnConnection = () => this.network.registerPlayer("Test");
        //return;

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

    addPlayers(players: any) {
        if (!this.players) this.players = [];

        players.forEach(player => {
            var tPlayer = this.players.filter(p => p.token === player.token)[0];
            if (!tPlayer) {
                var newPlayer = new Player(this.isoGroup, this.sortGroup, player);
                this.players.push(newPlayer);
            }
        });
    }

    updatePlayers(players: any) {
        players.forEach(player => {
            if (player.token !== this.curPlayer.token) {
                var tPlayer = this.players.filter(p => p.token === player.token)[0];
                if (tPlayer) tPlayer.hero.move(this.map.cellAt(player.x, player.y));
            }
        });
    }

    update() {
        this.handleMouse();
        
        //this.isoGroup.forEach(tile => {
        //    SimpleGame.game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
        //}, this);
    }

    private handleMouse() {
        SimpleGame.iso.projector.unproject(SimpleGame.game.input.activePointer.position, this.cursorPosition);
    }

    onLeftMouseClick() {
        var mapCellOverMouse = this.map.cellsAtScreenCoords(this.cursorPosition.x, this.cursorPosition.y);
        if (mapCellOverMouse) {
            if (this.curPlayer.hero.move(mapCellOverMouse)) {
                this.network.sendHeroMove(this.curPlayer, mapCellOverMouse.pos);
            }
        }
    }

    setCurrentPlayer(parsedPlayer) {
        if (!this.players) this.players = [];
        this.curPlayer = new Player(this.isoGroup, this.sortGroup, parsedPlayer);
        this.players.push(this.curPlayer);
    }
}

class Player {
    token: string;
    name: string;
    hero: Hero;

    private isoGroup: Phaser.Group;
    private sortGroup: Phaser.Group;

    constructor(isoGroup: Phaser.Group, sortGroup: Phaser.Group, player: any) {
        this.token = player.token;
        this.name = player.name;
        this.isoGroup = isoGroup; // todo: drawer responsibility, not player

        this.hero = new Hero(isoGroup, SimpleGame.scene.map.cellAt(player.x, player.y));
        sortGroup.add(this.hero.drawable.sprite);
    }

    removeHero() {
        this.isoGroup.remove(this.hero.drawable.sprite, true);
        this.sortGroup.remove(this.hero.drawable.sprite, true);
    }
}

class Hero {
    drawable: DrawableObject;
    onCell: MapCell;
    isWalking: boolean;
    speed = 350; // px per second
    walkAnimation: Phaser.Animation;
    private lastWalkTween: Phaser.Tween;

    constructor(isoGroup: Phaser.Group, onCell: MapCell) {
        if (!onCell) onCell = SimpleGame.scene.map.cellAt(0, 0);
        this.drawable = new DrawableObject(onCell.pos.x, onCell.pos.y, null, isoGroup, true, "peoples");
        this.drawable.sprite.resetFrame();
        this.walkAnimation = this.drawable.sprite.animations.add('walk');
        this.drawable.sprite.anchor.set(0.5, 0.5);

        this.onCell = onCell;
        //this.object.sprite.body.collideWorldBounds = true;
    }

    move(cell: MapCell): boolean {
        if (!cell || cell.isWall || this.onCell === cell) return false;

        var path = SimpleGame.scene.map.getPathToCellFromPoint(this.drawable.getScreenPos(), cell);
        if (!path || path.length === 0) return false;

        if (this.lastWalkTween) {
            SimpleGame.game.tweens.remove(this.lastWalkTween);
        }

        this.isWalking = true;
        this.walkAnimation.play(10, true);
        var curPos: Phaser.Point;
        var prevPos = this.drawable.getScreenPos();

        var tween = SimpleGame.game.add.tween(this.drawable.sprite);
        for (var i = 0; i < path.length; i++) {
            var targetCell = SimpleGame.scene.map.cellAt(path[i].pos.x, path[i].pos.y);
            curPos = targetCell.drawable.getScreenPos();
            var timeForMove = Phaser.Point.distance(prevPos, curPos) / this.speed * 1000;
            tween.to({ isoX: curPos.x, isoY: curPos.y }, Math.round(timeForMove), "Linear", false);

            prevPos = curPos;
        }
        tween.onComplete.add(() => {
            this.isWalking = false;
            this.onCell = cell;
            this.walkAnimation.stop(true);
            console.log("Movement done!");
        }, this);
        tween.start();
        this.lastWalkTween = tween;
        return true;
    }
}

class DrawableObject {
    static spriteSize = 32;
    sprite: Phaser.Plugin.Isometric.IsoSprite;

    constructor(x: number, y: number, textureName: string, isoGroup: Phaser.Group, isRelativeCoords = false, tileSet = "tileset") {
        var targetX, targetY;
        if (isRelativeCoords) {
            targetX = x * DrawableObject.spriteSize;
            targetY = y * DrawableObject.spriteSize;
        } else {
            targetX = x;
            targetY = y;
        }
        
        this.sprite = <Phaser.Plugin.Isometric.IsoSprite>SimpleGame.iso.addIsoSprite(targetX, targetY, 0, tileSet, textureName, isoGroup);
        this.sprite.anchor.set(0.5, 0);
    }

    getScreenPos() : Phaser.Point {
        return new Phaser.Point(this.sprite.isoX, this.sprite.isoY);
    }

    moveToCell(cell: MapCell) {
        var cellPos = cell.drawable.getScreenPos();
        this.sprite.isoX = cellPos.x;
        this.sprite.isoY = cellPos.y;
    }

    isIntersects(x: number, y: number) : boolean {
        return this.sprite.isoBounds.containsXY(x, y);
    }
}

class MapCell {
    pos: Phaser.Point;
    drawable: DrawableObject;
    isWall: boolean;

    constructor(x: number, y: number, isWall: boolean, textureName: string, isoGroup: Phaser.Group) {
        this.isWall = isWall;
        this.pos = new Phaser.Point(x, y);

        this.drawable = new DrawableObject(x, y, textureName, isoGroup, true);
    }
}

class Map {
    private tileIndexes: number[][];
    private weightMap: number[][];
    private cells: MapCell[][];
    tileNamesArray: string[];

    width: number;
    height: number;

    constructor(tileIndexes: number[][]) {
        this.tileIndexes = tileIndexes;
        this.width = tileIndexes.length;
        this.height = tileIndexes[0].length;

        this.tileNamesArray= [];
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

    cellAt(x: number, y: number): MapCell {
        if (x >= this.width || x < 0 || y >= this.height || y < 0) {
            return null;
        }
        return this.cells[x][y];
    }

    getPathToCell(fromCell: MapCell, toCell: MapCell): astar.AStarData[] {
        return astar.AStar.search(this.weightMap, fromCell.pos, toCell.pos, [], true);
    }

    getPathToCellFromPoint(fromScreenPoint: Phaser.Point, toCell: MapCell): astar.AStarData[] {
        var cellAtPoint = this.cellsAtScreenCoords(fromScreenPoint.x, fromScreenPoint.y);
        if (cellAtPoint) return this.getPathToCell(cellAtPoint, toCell);
        return [];
    }

    cellsAtScreenCoords(x: number, y: number, colorize = false): MapCell {
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
    }

    drawMap() {
        this.weightMap = new Array(this.width);
        var isWall: boolean;

        this.cells = new Array(this.width);
        for (var i = 0; i < this.width; i++) {

            this.cells[i] = new Array(this.height);
            this.weightMap[i] = new Array(this.height);

            for (var j = 0; j < this.height; j++) {
                var tileIndex = this.tileIndexes[i][j];

                isWall = tileIndex === 0;
                var tile = new MapCell(i, j, isWall, this.tileNamesArray[tileIndex], SimpleGame.scene.isoGroup);
                if (tileIndex === 8 || tileIndex === 9) SimpleGame.scene.sortGroup.add(tile.drawable.sprite);

                this.weightMap[i][j] = isWall ? 0 : 1;
                this.cells[i][j] = tile;
            }
        }
    }
}