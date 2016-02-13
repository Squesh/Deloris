/**
 * Author: Ats Uiboupin, see https://github.com/jmesnil/stomp-websocket/issues/61
 * it is possible to use other type of WebSockets by using the Stomp.over(ws) method. This method expects an object that conforms to the WebSocket definition.
 * TODO specifi minimal required object structure, see SockJS as an acceptable example: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/sockjs/sockjs.d.ts#L23
 */
declare type StompMinimalWebSocketDefinition = any;
declare type StompWebSocketDefinition = WebSocket | StompMinimalWebSocketDefinition | SockJS;

declare type StompHeaders = { [key: string ]: string;};
declare type StompSubscriptions = { [key: string ]: string;};
declare type StompFrameCallback = (frame: StompFrame) => void;

interface StompFrame {
  command: string;
  headers: StompHeaders;
  body?: string;
}

interface StompStatic {
  over(webSocket: StompWebSocketDefinition): StompClient;
}

interface StompSubscription {
  id: any;
  unsubscribe: () => void;
}

interface HeartBeatConfig {
    incoming : number;
    outgoing : number;
}

interface StompClient {
  /* START: object internals, maybe not for public use
  connectCallback: StompFrameCallback;
  connected: boolean;
  counter: number;
  maxWebSocketFrameSize: number;
  partialData: string;
  serverActivity: number;
  subscriptions: { [key: string ]: StompFrameCallback;};
  ws: StompMinimalWebSocketDefinition;
  */
  send(destination: string, headers?: any, body?: string);
  debug: (msg: string) => void;
  heartbeat : HeartBeatConfig;
  connect(login: string, passcode: string, connectCallback?: () => void, errorCallback?: () => void, host?: string);
  connect(headers: StompHeaders, connectCallback?: StompFrameCallback, errorCallback?: StompFrameCallback);
  subscribe(destination: string, callback: (stompFrame: StompFrame, headers?: StompHeaders) => void): StompSubscription;
  disconnect(disconnectCallback?: () => void);
}

declare var Stomp: StompStatic;
