// ============================================================
// login.ts
// מיקום: src/app/components/auth/login/login.ts
// ============================================================
// דף ההתחברות — עם Reactive Forms ו-Validators.
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  // הגדרת הטופס הריאקטיבי עם Validators
  loginForm: FormGroup;

  // הודעת שגיאה מהשרת
  errorMessage = '';
// הזרקת FormBuilder, AuthService ו-Router
  constructor(
    private fb:          FormBuilder,
    private authService: AuthService,
    private router:      Router
  ) {
    // יצירת הטופס עם בדיקות תקינות
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  // גישה נוחה לשדות
  get email()    { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  // שליחת הטופס
  onLogin() {
    //אם יש שגיאות
    if (this.loginForm.invalid) {
      //מסמנים שכאילו כל השדות נגעו בהם, ואז קופץ כל השגיאות למשתמש
      this.loginForm.markAllAsTouched();
      return;
    }
    // שולחים את הנתונים לשירות האימות ומאזינים לתגובה
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.errorMessage = 'פרטי התחברות שגויים, נסי שוב.';
      }
    });
  }
}