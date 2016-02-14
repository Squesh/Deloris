var NetworkManager = (function () {
    function NetworkManager(scene) {
        var _this = this;
        this.url = "https://deloris.herokuapp.com/entry";
        console.log(scene);
        this.socket = new SockJS(this.url);
        this.stompClient = Stomp.over(this.socket);
        this.stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            _this.stompClient.subscribe('/topic/init-players', function (players) {
                var parsedPlayers = JSON.parse(players.body);
                scene.addPlayers(parsedPlayers);
            });
            _this.stompClient.subscribe('/topic/players', function (players) {
                var parsedPlayers = JSON.parse(players.body);
                scene.updatePlayers(parsedPlayers);
            });
            var subscription = _this.stompClient.subscribe('/topic/registering-player', function (player) {
                var parsedPlayer = JSON.parse(player.body);
                scene.setCurrentPlayer(parsedPlayer);
                _this.stompClient.send("/app/get-players", {});
                _this.runSendMoveLoop(scene);
                subscription.unsubscribe();
            });
            if (_this.actionOnConnection != null)
                _this.actionOnConnection();
        });
        window.onbeforeunload = function () { return _this.disconnect(); };
    }
    NetworkManager.prototype.sendMove = function (token, x, y) {
        this.stompClient.send("/app/move-player", {}, JSON.stringify({ "token": token, 'newX': x, "newY": y }));
    };
    NetworkManager.prototype.registerPlayer = function (name) {
        this.stompClient.send("/app/register-player", {}, JSON.stringify(name));
    };
    NetworkManager.prototype.runSendMoveLoop = function (scene) {
        var _this = this;
        var prevPosX = -1;
        var prevPosY = -1;
        window.setInterval(function () {
            var curX = Math.floor(scene.curPlayer.tile.body.x);
            var curY = Math.floor(scene.curPlayer.tile.body.y);
            var needSend = false;
            if (prevPosX !== curX) {
                needSend = true;
                prevPosX = curX;
            }
            if (prevPosY !== curY) {
                needSend = true;
                prevPosY = curY;
            }
            if (needSend)
                _this.sendMove(scene.curPlayer.token, curX, curY);
        }, 100);
    };
    NetworkManager.prototype.disconnect = function () {
    };
    return NetworkManager;
})();
//# sourceMappingURL=networkManager.js.map