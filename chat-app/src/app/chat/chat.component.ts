import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from '../socket.service';
import { DeleteConfirmDialog } from '../delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
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

  editingMessageId: string | null = null;
  editingMessageText: string = '';

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) {}

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

    this.socketService.onMessageDeleted().subscribe((data) => {
      if (data && data.message_id) {
        this.messages = this.messages.filter(m => m.id !== data.message_id);
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

  confirmDelete(chatId: string, event: MouseEvent) {
    event.stopPropagation(); // чтобы не вызывался selectChat
    const dialogRef = this.dialog.open(DeleteConfirmDialog);

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteChat(chatId);
      }
    });
  }

  deleteChat(chatId: string) {
    this.http.delete(`/api/chats/${chatId}`).subscribe({
      next: () => {
        this.chats = this.chats.filter((chat) => chat.id !== chatId);
        if (this.selectedChatId === chatId) {
          this.selectedChatId = null;
        }
        this.snackBar.open('Чат удалён', 'Закрыть', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Не удалось удалить чат', 'Закрыть', { duration: 2000 });
      }
    });
  }

  deleteMessage(messageId: string) {
    this.socketService.deleteMessage(messageId);
  }

  regenerateMessage(messageId: string) {
    this.socketService.regenerateMessage(messageId);
  }

  startEditMessage(msg: any) {
    this.editingMessageId = msg.id;
    this.editingMessageText = msg.message;
  }

  cancelEditMessage() {
    this.editingMessageId = null;
    this.editingMessageText = '';
  }

  applyEditMessage() {
    if (this.editingMessageId && this.editingMessageText.trim()) {
      this.socketService.editMessage(this.editingMessageId, this.editingMessageText.trim());
      // Обновить текст сообщения локально
      const msg = this.messages.find(m => m.id === this.editingMessageId);
      if (msg) {
        msg.message = this.editingMessageText.trim();
      }
    }
    this.cancelEditMessage();
  }
}
