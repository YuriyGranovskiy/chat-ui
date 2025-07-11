import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() userId!: string;

  name = '';
  initial = '';
  chats: any[] = [];
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats() {
    this.http.get<any>(`/api/chats?user_id=${this.userId}`).subscribe({
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
}
