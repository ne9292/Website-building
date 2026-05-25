// ============================================================
// auth.guard.ts
// מיקום: src/app/guards/auth.guard.ts
// ============================================================
// Guard שמגן על נתיבים שדורשים התחברות.
// אם המשתמש לא מחובר — מפנה לדף הלוגין.
// משתמש ב-AuthService בלבד — לא ניגש ל-localStorage ישירות.
// ============================================================

import { inject } from '@angular/core';
// inject — מאפשר הזרקת שירותים בפונקציה (ללא constructor)

import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

// Guard פונקציונלי (Angular 15+) — פונקציה ולא class
export const authGuard = () => {
  const router      = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    // מחובר — מאפשר כניסה לנתיב
    return true;
  }

  // לא מחובר — מפנה לדף הלוגין וחוסם את הנתיב
  router.navigate(['/login']);
  return false;
};