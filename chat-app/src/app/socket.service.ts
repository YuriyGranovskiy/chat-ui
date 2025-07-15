// src/app/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (!this.socket) {
      this.socket = io('ws://localhost:5000', {
        transports: ['websocket'],
      });
    }
  }

  joinChat(chatId: string): void {
    this.socket?.emit('join_chat', { chat_id: chatId });
  }

  sendMessage(chatId: string, message: string): void {
    this.socket?.emit('send_message', { chat_id: chatId, message });
  }

  onNewMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket?.on('new_message', (data) => {
        observer.next(data);
      });
    });
  }
}
