var NetworkManager = (function () {
    function NetworkManager(scene) {
        var _this = this;
        this.url = "https://deloris.herokuapp.com/entry";
        this.scene = scene;
        this.socket = new SockJS(this.url);
        this.stompClient = Stomp.over(this.socket);
        this.stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            _this.stompClient.subscribe('/topic/init-heroes', function (players) {
                var parsedPlayers = JSON.parse(players.body);
                scene.addPlayers(parsedPlayers);
            });
            _this.stompClient.subscribe('/topic/heroes', function (players) {
                var parsedPlayers = JSON.parse(players.body);
                scene.updatePlayers(parsedPlayers);
            });
            var subscription = _this.stompClient.subscribe('/topic/registering-hero', function (player) {
                var parsedPlayer = JSON.parse(player.body);
                scene.setCurrentPlayer(parsedPlayer);
                _this.stompClient.send("/app/get-heroes", {});
                subscription.unsubscribe();
            });
            if (_this.actionOnConnection != null)
                _this.actionOnConnection();
        });
        window.onbeforeunload = function () { return _this.disconnect(); };
    }
    NetworkManager.prototype.sendMove = function (token, x, y) {
        this.stompClient.send("/app/move-hero", {}, JSON.stringify({ "token": token, 'newX': x, "newY": y }));
    };
    NetworkManager.prototype.registerPlayer = function (name) {
        this.stompClient.send("/app/register-hero", {}, JSON.stringify(name));
    };
    NetworkManager.prototype.sendHeroMove = function (player, position) {
        this.sendMove(player.token, position.x, position.y);
    };
    NetworkManager.prototype.disconnect = function () {
        var token = this.scene.curPlayer.token;
        this.stompClient.send("/app/unregister-hero", {}, JSON.stringify(token));
    };
    return NetworkManager;
})();
//# sourceMappingURL=networkManager.js.map