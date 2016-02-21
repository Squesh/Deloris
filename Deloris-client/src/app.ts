class SimpleGame {

    constructor() {
        SimpleGame.game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio,
            Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }

    static game: Phaser.Game;
    static iso: Phaser.Plugin.Isometric;
    static isoArcade: Phaser.Plugin.Isometric.Arcade;
    static scene: Scene;

    preload() {
        SimpleGame.scene = new Scene();
        SimpleGame.game.time.advancedTiming = true;
        SimpleGame.game.stage.disableVisibilityChange = true;

        SimpleGame.iso = new Phaser.Plugin.Isometric(SimpleGame.game);
        SimpleGame.isoArcade = new Phaser.Plugin.Isometric.Arcade(SimpleGame.game);

        SimpleGame.game.plugins.add(SimpleGame.iso);

        SimpleGame.game.load.atlasJSONHash('tileset', 'assets/tileset.png', 'assets/tileset.json');
        SimpleGame.game.load.spritesheet('peoples', 'assets/people.png', 32, 48, 100);

        SimpleGame.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        SimpleGame.iso.projector.anchor.setTo(0.5, 0.2);

        SimpleGame.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN
        ]);
    }

    static resizeToMapSize(width: number, height: number) {
        console.log(SimpleGame.game.world.bounds);
        var newStartX = Math.floor(SimpleGame.game.width / 2 - width / 2);
        var newStartY = Math.floor(SimpleGame.game.height / 2 - height / 2);
        SimpleGame.game.world.setBounds(newStartX, newStartY, width, height);
    }

    create() {
        SimpleGame.scene.createScene();
    }

    update() {
        SimpleGame.scene.update();
    }

    render() {
        SimpleGame.game.debug.text(SimpleGame.game.time.fps.toString() || '--', 2, 14, "#a7aebe");
        SimpleGame.iso.projector.simpleSort(SimpleGame.scene.sortGroup);
    }
}

window.onload = () => {
    var game = new SimpleGame();
};