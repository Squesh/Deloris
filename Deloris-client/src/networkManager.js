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
            _this.stompClient.send("/app/get-players", {});
        });
    }
    NetworkManager.prototype.sendMove = function (id, x, y) {
        this.stompClient.send("/app/move-player", {}, JSON.stringify({ "id": id, 'newX': x, "newY": y }));
    };
    return NetworkManager;
})();
//# sourceMappingURL=networkManager.js.map