// ============================================================
// auth.ts
// מיקום: src/app/services/auth.ts
// ============================================================
// שירות האימות — אחראי על התחברות, הרשמה והתנתקות.
// כל הלוגיקה של JWT והטוקן מרוכזת כאן בלבד.
// קבצים אחרים לא ניגשים ל-localStorage ישירות — רק דרך שירות זה.
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { SiteService } from './site';
import { RegisterDto, LoginDto, AuthResponseDto } from '../models/auth.models';
@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient, private siteService: SiteService) {}

  // ===== הרשמה =====
  // שולח בקשת POST עם fullName, email, password
  // מחזיר Observable שהקומפוננטה מאזינה לו
  register(data: RegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, data);
  }

  // ===== התחברות =====
  // שולח בקשת POST עם email, password
  // tap — שומר את הטוקן ב-localStorage אחרי התחברות מוצלחת
  // הטוקן נשמר כדי שיישאר גם אחרי רענון הדפדפן
  login(data: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        if (response.isSuccess && response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  // ===== קבלת שם משתמש =====
  // מחלץ את שם המשתמש מהטוקן השמור
  // jwtDecode מפענח את הטוקן ומחזיר את שדה FullName
  // מחזיר מחרוזת ריקה אם אין טוקן או שהטוקן פגום
  getUserName(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';

    try {
      const decoded: any = jwtDecode(token);
      return decoded['FullName'] || '';
    } catch {
      return '';
    }
  }

  // ===== בדיקת התחברות =====
  // בודק אם יש טוקן ב-localStorage
  // !! ממיר את הערך ל-boolean: null → false, string → true
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ===== התנתקות =====
  logout() {
    localStorage.removeItem('token');
    this.siteService.clearCache();
  }
}