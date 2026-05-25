// ============================================================
// register.ts
// מיקום: src/app/components/auth/register/register.ts
// ============================================================
// דף ההרשמה — יצירת חשבון חדש.
// אחרי הרשמה מוצלחת: ממתין 2 שניות ועובר לדף הלוגין.
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  // נתוני הטופס — מחוברים ל-[(ngModel)] בתבנית
  registerData = { fullName: '', email: '', password: '' };

  // הודעה למשתמש — הצלחה או שגיאה
  message = '';

  // האם ההרשמה הצליחה — משנה את צבע ההודעה
  isSuccess = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // שליחת טופס ההרשמה
  onRegister() {
    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'נרשמת בהצלחה! מעביר אותך לאתר...';
        // ממתין 2 שניות   
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: () => {
        this.isSuccess = false;
        this.message = 'חלה שגיאה בהרשמה. ייתכן שהאימייל כבר קיים.';
      }
    });
  }
}