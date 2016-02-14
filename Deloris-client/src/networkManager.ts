class NetworkManager {
    constructor(scene: Scene) {
        console.log(scene);
        this.socket = new SockJS(this.url);
        this.stompClient = Stomp.over(this.socket);
        this.stompClient.connect({}, frame => {
            console.log('Connected: ' + frame);

            this.stompClient.subscribe('/topic/init-players', players => {
                var parsedPlayers = JSON.parse(players.body);
                scene.addPlayers(parsedPlayers);
            });

            this.stompClient.subscribe('/topic/players', players => {
                var parsedPlayers = JSON.parse(players.body);
                scene.updatePlayers(parsedPlayers);
            });

            var subscription = this.stompClient.subscribe('/topic/registering-player', player => {
                var parsedPlayer = JSON.parse(player.body);
                scene.setCurrentPlayer(parsedPlayer);
                this.stompClient.send("/app/get-players", {});
                this.runSendMoveLoop(scene);
                subscription.unsubscribe();
            });

            if (this.actionOnConnection != null) this.actionOnConnection();
        });

        window.onbeforeunload = () => this.disconnect();
    }

    socket: SockJS;
    stompClient: StompClient;
    
    url = "https://deloris.herokuapp.com/entry";

    sendMove(token: string, x: number, y: number) {
        this.stompClient.send("/app/move-player", {}, JSON.stringify({ "token": token, 'newX': x, "newY": y }));
    }

    registerPlayer(name: string) {
        this.stompClient.send("/app/register-player", {}, JSON.stringify(name));
    }

    actionOnConnection: () => void;

    runSendMoveLoop(scene: Scene) {
        var prevPosX = -1;
        var prevPosY = -1;
        window.setInterval(() => {
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

            if (needSend) this.sendMove(scene.curPlayer.token, curX, curY);
        }, 100);
    }

    disconnect() {
        
    }
}