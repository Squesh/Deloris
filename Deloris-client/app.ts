class SimpleGame {

    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }

    game: Phaser.Game;
    iso: Phaser.Plugin.Isometric;
    isoArcade: Phaser.Plugin.Isometric.Arcade;
    water: Phaser.Plugin.Isometric.IsoSprite[];
    isoGroup: Phaser.Group;

    preload() {
        this.game.time.advancedTiming = true;
        this.game.debug.renderShadow = false;
        this.game.stage.disableVisibilityChange = true;

        this.iso = new Phaser.Plugin.Isometric(this.game);
        this.isoArcade = new Phaser.Plugin.Isometric.Arcade(this.game);

        this.game.plugins.add(this.iso);

        this.game.load.atlasJSONHash('tileset', 'assets/tileset.png', 'assets/tileset.json');

        this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        this.iso.projector.anchor.setTo(0.5, 0.1);
    }

    create() {

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
                tile = <Phaser.Plugin.Isometric.IsoSprite> this.iso.addIsoSprite(x, y, tileArray[tiles[i]].match("water") ? 0 : this.game.rnd.pick([2, 3, 4]), 'tileset', tileArray[tiles[i]], this.isoGroup);
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
    }

    update() {
        this.water.forEach(w => {
            w.isoZ = (-2 * Math.sin((this.game.time.now + (w.isoX * 7)) * 0.004)) + (-1 * Math.sin((this.game.time.now + (w.isoY * 8)) * 0.005));
            w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.1), 0.2, 1);
        });
    }

    render() {
        //this.isoGroup.forEach(tile => {
        //    this.game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
        //}, null);
        this.game.debug.text(this.game.time.fps.toString() || '--', 2, 14, "#a7aebe");
    }
}

window.onload = () => {
    var game = new SimpleGame();
};