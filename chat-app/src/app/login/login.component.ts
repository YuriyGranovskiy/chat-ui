import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
  }

  submit() {
    const payload = { username: this.username, password: this.password };
    const url = this.isRegisterMode ? '/api/register' : '/api/login';

    this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        localStorage.setItem('access_token', res.access_token);
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.errorMessage = 'Ошибка: ' + (err?.error?.message || 'что-то пошло не так');
      }
    });
  }
}
