const WS_URL = 'ws://localhost:3001';

let ws: WebSocket | null = null;

export function connect() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => console.log('WS connected');
  ws.onclose = () => {
    console.log('WS disconnected');
    setTimeout(connect, 3000);
  };
  ws.onerror = (err) => console.error('WS error', err);
}

export function send(data: unknown) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function onMessage(handler: (data: unknown) => void) {
  if (ws) {
    ws.onmessage = (event) => {
      try {
        handler(JSON.parse(event.data));
      } catch {
        // ignore
      }
    };
  }
}

export function disconnect() {
  ws?.close();
  ws = null;
}
