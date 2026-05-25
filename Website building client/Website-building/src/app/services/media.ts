// ============================================================
// media.ts
// מיקום: src/app/services/media.ts
// ============================================================
// שירות המדיה — אחראי על העלאת קבצים לשרת.
// מרכז את כל העלאות הקבצים במקום אחד:
// תמונות, וידאו ו-PDF — כולם עוברים דרך אותו endpoint.
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MediaService {

  // כתובת ה-API של המדיה
  private apiUrl = `${environment.apiUrl}/api/media`;

  constructor(private http: HttpClient) {}

  // ===== העלאת תמונה =====
  // מקבל קובץ תמונה ומחזיר Observable עם ה-URL שנוצר בשרת
  // משמש גם להעלאת PDF — אותו endpoint
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    // 'file' — שם השדה שהשרת מצפה לו
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
  }

  // ===== העלאת וידאו =====
  // זהה להעלאת תמונה — אותו endpoint, אבל מופרד לבהירות
  uploadVideo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
  }
}