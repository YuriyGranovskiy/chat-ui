import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any = null;

  connect(): void {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.error('Authentication token not found. Cannot connect to socket.');
      return;
    }
    
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('ws://localhost:5000', {
      transports: ['websocket'],
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully. ID:', this.socket?.id);
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected.');
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
      this.socket?.on('new_message', (data: any) => {
        observer.next(data);
      });
      // Очистка при отписке
      return () => {
        this.socket?.off('new_message');
      };
    });
  }

  deleteMessage(messageId: string): void {
    this.socket?.emit('delete_message', { message_id: messageId });
  }

  regenerateMessage(messageId: string): void {
    this.socket?.emit('regenerate_message', { message_id: messageId });
  }

  onMessageDeleted(): Observable<any> {
    return new Observable((observer) => {
      this.socket?.on('message_deleted', (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket?.off('message_deleted');
      };
    });
  }
}