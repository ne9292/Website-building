// ============================================================
// logged-in.guard.ts
// מיקום: src/app/guards/logged-in.guard.ts
// ============================================================
// Guard שמגן על דפים שמחוברים לא צריכים לראות (לוגין, הרשמה).
// אם המשתמש כבר מחובר — מפנה ל-dashboard.
// ✅ תיקון כפל קוד: login.ts בדק isLoggedIn בקונסטרקטור —
//    עכשיו הבדיקה מתבצעת רק כאן, לא בשני מקומות
// ============================================================

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const loggedInGuard = () => {
  const router      = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    // כבר מחובר — אין צורך לראות דף לוגין, מפנה ל-dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  // לא מחובר — מאפשר כניסה לדף הלוגין
  return true;
};