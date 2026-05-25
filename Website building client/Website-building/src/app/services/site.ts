// ============================================================
// site.ts
// מיקום: src/app/services/site.ts
// ============================================================
// שירות האתרים — אחראי על כל הקריאות לשרת הקשורות לאתרים ודפים.
// כולל cache לאתרים כדי למנוע טעינה מחדש מיותרת בכל כניסה ל-dashboard.
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
// of — יוצר Observable שמחזיר ערך מיידי (לשימוש ב-cache)
// tap — מאפשר פעולה צדדית (שמירה ל-cache) בלי לשנות את הנתונים
import { environment } from '../../environments/environment';
import { Site, CreateSiteDto, UpdateSiteDto, Page, CreatePageDto, UpdatePageDto } from '../models/canvas.models';

@Injectable({ providedIn: 'root' })
export class SiteService {

  // כתובת ה-API של האתרים
  private apiUrl = `${environment.apiUrl}/api/sites`;

  // ===== Cache =====
  // שומר את רשימת האתרים בזיכרון לאחר הטעינה הראשונה.
  // null = עדיין לא נטען | [] = נטען ואין אתרים | [...] = יש אתרים
  // כך כל כניסה ל-dashboard לא שולחת בקשה מיותרת לשרת
  private sitesCache: Site[] | null = null;

  constructor(private http: HttpClient) {}

  // ===== קבלת כל האתרים =====
  getSites(): Observable<Site[]> {
    // אם יש נתונים ב-cache — מחזירים אותם מיד בלי לקרוא לשרת
    if (this.sitesCache !== null) {
      return of(this.sitesCache);
    }
    // אם אין ב-cache — שולחים בקשה לשרת, ושומרים את התוצאה ב-cache
    return this.http.get<Site[]>(this.apiUrl).pipe(
      tap(sites => this.sitesCache = sites)
    );
  }

  // ===== ניקוי Cache =====
  clearCache() {
    this.sitesCache = null;
  }

  // ===== יצירת אתר =====
  createSite(siteData: CreateSiteDto): Observable<Site> {
    return this.http.post<Site>(this.apiUrl, siteData).pipe(
      // אחרי יצירת אתר חדש — מנקים את ה-cache כדי שנטען מחדש עם האתר החדש
      tap(() => this.clearCache())
    );
  }

  // ===== מחיקת אתר =====
  deleteSite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  // ===== עדכון דף =====
  updatePage(siteId: number, pageId: number, pageData: UpdatePageDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${siteId}/pages/${pageId}`, pageData);
  }

  // ===== קבלת דפים =====
  getPages(siteId: number): Observable<Page[]> {
    return this.http.get<Page[]>(`${this.apiUrl}/${siteId}/pages`);
  }

  // ===== יצירת דף =====
  createPage(siteId: number, pageData: CreatePageDto): Observable<Page> {
    return this.http.post<Page>(`${this.apiUrl}/${siteId}/pages`, pageData);
  }

  // ===== מחיקת דף =====
  deletePage(siteId: number, pageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${siteId}/pages/${pageId}`);
  }

  // ===== קבלת אתר לפי subdomain — לדף הציבורי =====
  getSiteBySubdomain(subdomain: string): Observable<Site> {
    return this.http.get<Site>(`${this.apiUrl}/public/${subdomain}`);
  }

  // ===== עדכון פרטי אתר =====
  updateSite(id: number, data: UpdateSiteDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  // ===== פרסום / ביטול פרסום אתר =====
  publishSite(id: number, isPublished: boolean): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/publish`, { isPublished }).pipe(
      tap(() => this.clearCache())
    );
  }
  }