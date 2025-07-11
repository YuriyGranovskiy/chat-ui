import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  isRegisterMode = false;
  errorMessage = '';

  @Output() loginSuccess = new EventEmitter<string>();

  constructor(private http: HttpClient) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
  }

  submit() {
    const payload = { username: this.username, password: this.password };
    const url = this.isRegisterMode ? '/api/register' : '/api/login';

    this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        this.loginSuccess.emit(res.user_id);
      },
      error: (err) => {
        this.errorMessage = 'Ошибка: ' + (err?.error?.message || 'что-то пошло не так');
      }
    });
  }
}
