// ============================================================
// app.config.ts
// מיקום: src/app/app.config.ts
// ============================================================
// הגדרות הבסיס של האפליקציה — נטען פעם אחת בהפעלה.
// כולל: Router, HttpClient עם ה-interceptor שמוסיף JWT.
// ============================================================

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // הגדרת ה-Router עם כל הנתיבים
    provideRouter(routes),

    // הגדרת HttpClient עם ה-interceptor
    // withInterceptors — מוסיף את authInterceptor לכל בקשת HTTP
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};