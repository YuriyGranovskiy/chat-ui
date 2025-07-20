import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'delete-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Удалить чат?</h2>
    <mat-dialog-content>Вы уверены, что хотите удалить этот чат?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Отмена</button>
      <button mat-button color="warn" [mat-dialog-close]="true">Удалить</button>
    </mat-dialog-actions>
  `
})
export class DeleteConfirmDialog {}