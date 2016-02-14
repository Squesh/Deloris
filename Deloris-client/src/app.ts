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

window.onload = () => {
    var game = new SimpleGame();
};