import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [HttpClientModule, CommonModule, LoginComponent, ChatComponent],
})
export class AppComponent {
  isLoggedIn = false;
  userId: string = '';

  onLogin(userId: string) {
    this.userId = userId;
    this.isLoggedIn = true;
  }
}