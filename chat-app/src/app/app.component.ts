import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    CommonModule,
    LoginComponent,
    ChatComponent,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
})
export class AppComponent {
  isLoggedIn = false;
  userId: string = '';

  onLogin(userId: string) {
    this.userId = userId;
    this.isLoggedIn = true;
  }
}