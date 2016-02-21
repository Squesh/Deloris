var SimpleGame = (function () {
    function SimpleGame() {
        SimpleGame.game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }
    SimpleGame.prototype.preload = function () {
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
    };
    SimpleGame.resizeToMapSize = function (width, height) {
        console.log(SimpleGame.game.world.bounds);
        var newStartX = Math.floor(SimpleGame.game.width / 2 - width / 2);
        var newStartY = Math.floor(SimpleGame.game.height / 2 - height / 2);
        SimpleGame.game.world.setBounds(newStartX, newStartY, width, height);
    };
    SimpleGame.prototype.create = function () {
        SimpleGame.scene.createScene();
    };
    SimpleGame.prototype.update = function () {
        SimpleGame.scene.update();
    };
    SimpleGame.prototype.render = function () {
        SimpleGame.game.debug.text(SimpleGame.game.time.fps.toString() || '--', 2, 14, "#a7aebe");
        SimpleGame.iso.projector.simpleSort(SimpleGame.scene.sortGroup);
    };
    return SimpleGame;
})();
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=app.js.map