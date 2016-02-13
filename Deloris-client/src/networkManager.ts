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

            this.stompClient.send("/app/get-players", {});
        });
    }

    socket: SockJS;
    stompClient: StompClient;
    
    url = "https://deloris.herokuapp.com/entry";

    sendMove(id: number, x: number, y: number) {
        this.stompClient.send("/app/move-player", {}, JSON.stringify({ "id": id, 'newX': x, "newY": y }));
    }
}