class NetworkManager {
    constructor(scene: Scene) {
        this.scene = scene;
        this.socket = new SockJS(this.url);
        this.stompClient = Stomp.over(this.socket);
        this.stompClient.connect({}, frame => {
            console.log('Connected: ' + frame);

            this.stompClient.subscribe('/topic/init-heroes', players => {
                var parsedPlayers = JSON.parse(players.body);
                scene.addPlayers(parsedPlayers);
            });

            this.stompClient.subscribe('/topic/heroes', players => {
                var parsedPlayers = JSON.parse(players.body);
                scene.updatePlayers(parsedPlayers);
            });

            var subscription = this.stompClient.subscribe('/topic/registering-hero', player => {
                var parsedPlayer = JSON.parse(player.body);
                scene.setCurrentPlayer(parsedPlayer);
                this.stompClient.send("/app/get-heroes", {});
                subscription.unsubscribe();
            });

            if (this.actionOnConnection != null) this.actionOnConnection();
        });

        window.onbeforeunload = () => this.disconnect();
    }

    socket: SockJS;
    stompClient: StompClient;
    scene: Scene;
    
    url = "https://deloris.herokuapp.com/entry";

    private sendMove(token: string, x: number, y: number) {
        this.stompClient.send("/app/move-hero", {}, JSON.stringify({ "token": token, 'newX': x, "newY": y }));
    }

    registerPlayer(name: string) {
        this.stompClient.send("/app/register-hero", {}, JSON.stringify(name));
    }

    actionOnConnection: () => void;

    sendHeroMove(player: Player, position: Phaser.Point) {
        this.sendMove(player.token, position.x, position.y);
    }

    disconnect() {
        var token = this.scene.curPlayer.token;
        this.stompClient.send("/app/unregister-hero", {}, JSON.stringify(token));
    }
}