// ============================================================
// booking.service.ts
// מיקום: src/app/services/booking.service.ts
// ============================================================
// שירות ההזמנות — אחראי על כל הקריאות לשרת הקשורות להזמנות תורים.
// כולל: קבלה, עדכון סטטוס, מחיקה ושליחת הודעות למזמינים.
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Booking, BookingDto } from '../models/booking.models';

@Injectable({ providedIn: 'root' })
export class BookingService {

  // כתובת ה-API של ההזמנות
  private api = `${environment.apiUrl}/api/bookings`;

  constructor(private http: HttpClient) {}

  // ===== קבלת הזמנות =====
  // מחזיר את כל ההזמנות של אתר מסוים לפי siteId
  getBookings(siteId: number) {
    return this.http.get<Booking[]>(`${this.api}/${siteId}`);
  }

  // ===== עדכון סטטוס =====
  // מעדכן את סטטוס ההזמנה: 'pending' | 'confirmed' | 'cancelled'
  updateStatus(id: number, status: string) {
    return this.http.put(`${this.api}/${id}/status`, { status });
  }

  // ===== מחיקת הזמנה =====
  deleteBooking(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  // ===== שליחת הודעה =====
  // שולח הודעה למזמין ספציפי לפי id
  // אם יש קובץ מצורף — שולח כ-FormData
  // אם אין — שולח כ-JSON רגיל (קל יותר לשרת)
  sendMessage(id: number, subject: string, message: string, attachment?: File) {
    if (attachment) {
      // יצירת FormData לשליחת קובץ — מאפשר לשלוח טקסט וקובץ באותה בקשה
      const formData = new FormData();
      // הוספת שדות הטקסט והקובץ ל-FormData
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('attachment', attachment);
      return this.http.post(`${this.api}/${id}/send-message`, formData);
    }
    return this.http.post(`${this.api}/${id}/send-message`, { subject, message });
  }

  // ===== יצירת הזמנה =====
  // נקרא מדף הציבורי — כשמישהו קובע תור
  createBooking(booking: BookingDto) {
    return this.http.post(this.api, booking);
  }
}