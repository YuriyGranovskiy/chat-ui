import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ChatApiService {
  constructor(private http: HttpClient) {}

  register(username: string, password: string) {
    return this.http.post('/api/register', { username, password });
  }

  login(username: string, password: string) {
    return this.http.post('/api/login', { username, password });
  }

  getChats() {
    return this.http.get(`/api/chats`);
  }

  getChat(chat_id: string) {
    return this.http.get(`/api/chats/${chat_id}`);
  }

  createChat(name: string, initial: string) {
    return this.http.post('/api/chats', { name, initial });
  }

  getMessages(chat_id: string, limit?: number, last_message_id?: string) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (last_message_id) params.append('last_message_id', last_message_id);
    return this.http.get(`/api/chats/${chat_id}/messages?${params.toString()}`);
  }

  sendMessage(chat_id: string, message: string) {
    return this.http.post(`/api/chats/${chat_id}/messages`, { message });
  }
}