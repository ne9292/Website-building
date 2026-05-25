// logged-in.guard.ts
// ==================
// Guard שמגן על דפים שמחוברים לא צריכים לראות (כמו לוגין והרשמה)
// אם המשתמש כבר מחובר — מפנה אותו ל-dashboard
// אם לא מחובר — מאפשר כניסה לדף

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth';

export const loggedInGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {

    router.navigate(['/dashboard']);
    return false;
  }

  // לא מחובר — מאפשר כניסה לדף לוגין
  return true;
};