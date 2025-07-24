import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from '../socket.service';
import { DeleteConfirmDialog } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Интерфейсы для типизации
interface Chat {
  id: string;
  name: string;
  // другие поля по необходимости
}

interface Message {
  id: string;
  message: string;
  sender_type: string;
  // другие поля по необходимости
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // === STATE ===
  name = '';
  initial = '';
  chats: Chat[] = [];
  messages: Message[] = [];
  newMessage = '';
  error = '';

  // Editing state
  editingMessageId: string | null = null;
  editingMessageText: string = '';

  // Ссылки на подписки для отписки
  private messageSub?: any;
  private deleteSub?: any;
  private routeSub?: Subscription;

  selectedChatId: string | null = null;

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // === LIFECYCLE ===
  ngOnInit(): void {
    this.loadChats();
    this.socketService.connect();
    this.routeSub = this.route.paramMap.subscribe(params => {
      const chatId = params.get('id');
      this.selectedChatId = chatId;
      this.messages = [];
      this.unsubscribeSocketEvents();
      if (chatId) {
        this.loadMessages(chatId);
        this.subscribeSocketEvents();
        this.socketService.joinChat(chatId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.unsubscribeSocketEvents();
    this.routeSub?.unsubscribe();
  }

  // === CHAT METHODS ===
  /** Загрузить список чатов */
  loadChats() {
    this.http.get<any>(`/api/chats`).subscribe({
      next: (res) => {
        this.chats = res.chats;
      },
      error: () => {
        this.error = 'Не удалось загрузить чаты';
      }
    });
  }

  /** Создать новый чат */
  createChat() {
    if (!this.name.trim() || !this.initial.trim()) {
      this.error = 'Заполните все поля';
      return;
    }
    const body = {
      name: this.name,
      initial: this.initial
    };
    this.http.post<any>('/api/chats', body).subscribe({
      next: () => {
        this.name = '';
        this.initial = '';
        this.loadChats();
      },
      error: () => {
        this.error = 'Ошибка при создании чата';
      }
    });
  }

  /** Выбрать чат и подписаться на события */
  selectChat(chatId: string): void {
    this.router.navigate(['/chat', chatId]);
  }

  /** Удалить чат */
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

  /** Подтвердить удаление чата */
  confirmDelete(chatId: string, event: MouseEvent) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DeleteConfirmDialog);
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteChat(chatId);
      }
    });
  }

  // === MESSAGE METHODS ===
  /** Загрузить сообщения чата */
  loadMessages(chatId: string) {
    this.http.get<any>(`/api/chats/${chatId}/messages`).subscribe({
      next: (res) => {
        this.messages = (res.messages || []).sort((a: Message, b: Message) => a.id.localeCompare(b.id));
      },
      error: () => {
        this.error = 'Ошибка загрузки сообщений';
      }
    });
  }

  /** Отправить сообщение */
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChatId) return;
    this.socketService.sendMessage(this.selectedChatId, this.newMessage);
    this.newMessage = '';
  }

  /** Удалить сообщение */
  deleteMessage(messageId: string) {
    this.socketService.deleteMessage(messageId);
  }

  /** Регенерировать сообщение */
  regenerateMessage(messageId: string) {
    this.socketService.regenerateMessage(messageId);
  }

  /** Начать редактирование сообщения */
  startEditMessage(msg: Message) {
    this.editingMessageId = msg.id;
    this.editingMessageText = msg.message;
  }

  /** Отменить редактирование сообщения */
  cancelEditMessage() {
    this.editingMessageId = null;
    this.editingMessageText = '';
  }

  /** Применить редактирование сообщения */
  applyEditMessage() {
    if (this.editingMessageId && this.editingMessageText.trim()) {
      this.socketService.editMessage(this.editingMessageId, this.editingMessageText.trim());
      const msg = this.messages.find(m => m.id === this.editingMessageId);
      if (msg) {
        msg.message = this.editingMessageText.trim();
      }
    }
    this.cancelEditMessage();
  }

  // === SOCKET EVENTS ===
  /** Подписаться на события сокета */
  private subscribeSocketEvents() {
    this.messageSub = this.socketService.onNewMessage().subscribe((msg: Message) => {
      if (msg) {
        this.messages.push(msg);
        this.messages.sort((a, b) => a.id.localeCompare(b.id));
        this.scrollToBottom();
      }
    });
    this.deleteSub = this.socketService.onMessageDeleted().subscribe((data: any) => {
      if (data && data.message_id) {
        this.messages = this.messages.filter(m => m.id !== data.message_id);
      }
    });
  }

  /** Отписаться от событий сокета */
  private unsubscribeSocketEvents() {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
      this.messageSub = undefined;
    }
    if (this.deleteSub) {
      this.deleteSub.unsubscribe();
      this.deleteSub = undefined;
    }
  }

  // === UI/UTILS ===
  /** Прокрутить вниз */
  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.scrollContainer && this.scrollContainer.nativeElement) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.warn('Scroll error', err);
    }
  }

  /** Только user/assistant сообщения */
  get filteredMessages(): Message[] {
    return this.messages.filter(m => m.sender_type === 'user' || m.sender_type === 'assistant');
  }

  /** Название выбранного чата или 'Сообщения' */
  get selectedChatName(): string {
    const chat = this.chats.find(c => c.id === this.selectedChatId);
    return chat?.name || 'Сообщения';
  }
}
