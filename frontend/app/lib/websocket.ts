// src/lib/websocket.ts
import { store } from './store';
import { api } from './api';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const token = store.getState().auth.token;
    this.socket = new WebSocket(
      `ws://localhost:5000/ws?token=${token}`
    );

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'TASK_UPDATED':
        store.dispatch(
          api.util.invalidateTags([{ type: 'Task', id: data.taskId }])
        );
        break;
      case 'PROJECT_UPDATED':
        store.dispatch(api.util.invalidateTags(['Project']));
        break;
      case 'NEW_COMMENT':
        // Handle new comment notification
        break;
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 3000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.socket?.close();
  }
}

export const websocketService = new WebSocketService();