var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }
    SimpleGame.prototype.preload = function () {
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
    };
    SimpleGame.prototype.create = function () {
        this.scene.createScene();
    };
    SimpleGame.prototype.update = function () {
        this.scene.updateWater();
        this.scene.handleInput();
    };
    SimpleGame.prototype.render = function () {
        //this.isoGroup.forEach(tile => {
        //    this.game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
        //}, null);
        this.game.debug.text(this.game.time.fps.toString() || '--', 2, 14, "#a7aebe");
    };
    return SimpleGame;
})();
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=app.js.map