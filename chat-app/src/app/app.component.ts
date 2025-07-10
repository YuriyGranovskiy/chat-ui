import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [LoginComponent, ChatComponent, CommonModule],
})
export class AppComponent {
  isLoggedIn = false;
  userId: string = '';

  onLogin(userId: string) {
    this.userId = userId;
    this.isLoggedIn = true;
  }
}