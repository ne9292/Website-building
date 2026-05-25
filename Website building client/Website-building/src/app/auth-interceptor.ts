// ============================================================
// auth-interceptor.ts
// מיקום: src/app/auth-interceptor.ts
// ============================================================
// מוסיף JWT לכל בקשה — חוץ מבקשות ציבוריות
// ============================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
// רשימת כתובות API ציבוריות — לא יתווסף להן ה-JWT
const PUBLIC_URLS = [
  '/api/sites/public/',
  '/api/auth/',
  'generativelanguage.googleapis.com',
];
// פונקציית ה-interceptor — מוסיפה את ה-JWT לכל בקשה פרט לבקשות ציבוריות
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // הזרקת Router דרך inject
  const router = inject(Router);
  // בדיקה אם הכתובת של הבקשה היא אחת מהכתובות הציבוריות
  const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));
// אם זו בקשה ציבורית — ממשיכים בלי להוסיף JWT
  if (isPublic) {
    return next(req);
  }
// אם זו בקשה פרטית — מוסיפים את ה-JWT מה-localStorage
  const token = localStorage.getItem('token');
// יצירת בקשה חדשה עם ה-Authorization header אם יש token
  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;
// שולחים את הבקשה ומטפלים בשגיאות 401 (Unauthorized)
  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // אם מקבלים 401 — כנראה שה-token לא תקין או פג תוקף
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};