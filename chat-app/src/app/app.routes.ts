import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { inject } from '@angular/core';

// Standalone AuthGuard
const authGuard = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'chat', canActivate: [authGuard], children: [
      { path: '', component: ChatComponent },
      { path: ':id', component: ChatComponent },
    ] },
  { path: '**', redirectTo: 'login' },
]; 