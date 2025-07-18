import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit {
  @Input() userId!: string;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  name = '';
  initial = '';
  chats: any[] = [];
  selectedChatId: string | null = null;
  messages: any[] = [];
  newMessage = '';
  error = '';

  constructor(private http: HttpClient, private socketService: SocketService) {}

  ngOnInit(): void {
    this.loadChats();
    this.socketService.connect();    
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

    private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.scrollContainer && this.scrollContainer.nativeElement) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      }, 50); // задержка для отрисовки новых сообщений
    } catch (err) {
      console.warn('Scroll error', err);
    }
  }

  loadChats() {
    this.http.get<any>(`/api/chats`).subscribe({
      next: (res) => {
        this.chats = res.chats;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить чаты';
      }
    });
  }

  createChat() {
    if (!this.name.trim() || !this.initial.trim()) {
      this.error = 'Заполните все поля';
      return;
    }

    const body = {
      user_id: this.userId,
      name: this.name,
      initial: this.initial
    };

    this.http.post<any>('/api/chats', body).subscribe({
      next: (res) => {
        this.name = '';
        this.initial = '';
        this.loadChats();
      },
      error: () => {
        this.error = 'Ошибка при создании чата';
      }
    });
  }

  selectChat(chatId: string): void {
    console.log('selectChat', chatId);
    this.selectedChatId = chatId;
    this.messages = [];
    
    this.socketService.onNewMessage().subscribe((msg) => {
      // Handle new message acti
      if (msg) {
        this.messages.push(msg);
        this.messages.sort((a, b) => a.id.localeCompare(b.id));
        this.scrollToBottom();
      }
    });

    this.socketService.joinChat(chatId);
  }

  loadMessages(chatId: string) {
    this.http.get<any>(`/api/chats/${chatId}/messages`).subscribe({
      next: (res) => {
        this.messages = (res.messages || []).sort((a: any, b: any) => a.id.localeCompare(b.id));
      },
      error: () => {
        this.error = 'Ошибка загрузки сообщений';
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChatId) return;
    this.socketService.sendMessage(this.selectedChatId, this.newMessage);
    this.newMessage = '';
  }
}
