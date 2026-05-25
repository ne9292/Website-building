import { inject } from '@angular/core';
import { Router } from '@angular/router';
// ייבוא AuthService — השירות המרכזי לניהול אימות
import { AuthService } from './services/auth';

// Guard פונקציונלי (Angular 15+) — מוגדר כפונקציה ולא כ-class
// מגן על נתיבים שדורשים התחברות
export const authGuard = () => {

  // הזרקת Router דרך inject (במקום constructor)
  const router = inject(Router);

  // הזרקת AuthService דרך inject
  const authService = inject(AuthService);

  // בדיקה אם המשתמש מחובר דרך השירות המרכזי
  if (authService.isLoggedIn()) {
    // המשתמש מחובר — מאפשר כניסה לנתיב
    return true;
  } else {
    // המשתמש לא מחובר — מנתב לדף ההתחברות
    router.navigate(['/login']);

    // מחזיר false — חוסם כניסה לנתיב המבוקש
    return false;
  }
};