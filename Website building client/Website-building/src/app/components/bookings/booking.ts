// ============================================================
// bookings.ts
// מיקום: src/app/components/bookings/bookings.ts
// ============================================================
// דף ניהול הזמנות — מציג, מעדכן ומוחק הזמנות של אתר.
// ✅ תיקון: הוסר ChangeDetectorRef — לא נדרש כי Angular
//    מגיב לשינויים ב-arrays אוטומטית כשמחליפים את המערך
// ✅ תיקון כפל קוד: getStatusLabel ו-getStatusClass
//    אוחדו לאובייקט אחד במקום שתי פונקציות נפרדות
// ============================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { SiteService } from '../../services/site';

//משתנה גלובלי שממפה סטטוסים לתוויות CSS ולתוויות טקסט
const STATUS_MAP: Record<string, { label: string; cssClass: string }> = {
  pending:   { label: 'ממתין',  cssClass: 'status-pending'   },
  confirmed: { label: 'מאושר',  cssClass: 'status-confirmed' },
  cancelled: { label: 'בוטל',   cssClass: 'status-cancelled' }
};

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class BookingsComponent implements OnInit {

  bookings: any[] = []; // רשימת ההזמנות
  siteId   = 0;         // מזהה האתר מה-URL
  siteName = '';        // שם האתר לכותרת
  loading  = true;      // מצב טעינה

  // דיאלוג שליחה ליחיד
  messageDialog: any   = null; // null = סגור, אחרת = ההזמנה שאליה שולחים
  messageSubject       = '';
  messageText          = '';
  attachment: File | null = null;

  // דיאלוג שליחה לכולם
  sendAllDialog = false;

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private bookingService: BookingService,
    private siteService:    SiteService
  ) {}
// קריאה ראשונית לטעינת ההזמנות ושם האתר
  ngOnInit() {
    // קבלת siteId מהנתיב
    this.siteId = Number(this.route.snapshot.paramMap.get('siteId'));
    // טעינת ההזמנות ושם האתר
    this.loadBookings();
    this.loadSite();
  }

  // טעינת הזמנות מהשרת
  loadBookings() {
    // מציגים את מצב הטעינה בזמן שהבקשה לשרת מתבצעת
    this.loading = true;
    this.bookingService.getBookings(this.siteId).subscribe({
      next: (data) => { this.bookings = data; this.loading = false; },
      error: ()     => { this.loading = false; }
    });
  }

  // טעינת שם האתר לכותרת
  loadSite() {
    this.siteService.getSites().subscribe({
      next: (sites) => {
        const site = sites.find(s => s.id === this.siteId);
        if (site) this.siteName = site.siteName;
      }
    });
  }

  // עדכון סטטוס הזמנה
  updateStatus(booking: any, status: string) {
    this.bookingService.updateStatus(booking.id, status).subscribe({
      next: () => booking.status = status
    });
  }

  // מחיקת הזמנה
  deleteBooking(id: number) {
    if (!confirm('למחוק את ההזמנה?')) return;
    this.bookingService.deleteBooking(id).subscribe({
      next: () => this.bookings = this.bookings.filter(b => b.id !== id)
    });
  }

  // קבלת תווית הסטטוס והמחלקה המתאימה לו
  getStatusLabel(status: string): string {
    return STATUS_MAP[status]?.label ?? status;
  }
// קבלת מחלקת CSS לפי הסטטוס
  getStatusClass(status: string): string {
    return STATUS_MAP[status]?.cssClass ?? '';
  }

  // פתיחת דיאלוג שליחה ליחיד
  openMessageDialog(booking: any) {
    this.messageDialog  = booking;
    this.messageSubject = '';
    this.messageText    = '';
    this.attachment     = null;
  }

  // שליחת הודעה ליחיד
  sendMessage() {
    // אם אין דיאלוג פתוח — לא שולחים כלום
    if (!this.messageDialog) return;
    // שולחים את ההודעה דרך שירות ההזמנות
    this.bookingService.sendMessage(
      this.messageDialog.id,
      this.messageSubject,
      this.messageText,
      this.attachment ?? undefined
    ).subscribe({
      next: () => {
        alert('הודעה נשלחה!');
        this.messageDialog = null;// סוגרים את הדיאלוג
        this.attachment    = null;// מנקים את הקובץ המצורף לזמן הבא
      },
      error: () => alert('שגיאה בשליחה')
    });
  }

  // פתיחת דיאלוג שליחה לכולם
  openSendAllDialog() {
    this.sendAllDialog  = true;// פותחים את הדיאלוג
    this.messageSubject = '';// מאפסים את שדות ההודעה לזמן הבא
    this.messageText    = '';// מנקים את הקובץ המצורף לזמן הבא
  }

  // שליחת הודעה לכל ההזמנות עם מייל
  sendToAll() {
    const withEmail = this.bookings.filter(b => b.email);// מסננים רק את ההזמנות שיש להן כתובת מייל
    if (withEmail.length === 0) { alert('אין הזמנות עם כתובת מייל'); return; }

    let sent = 0;// מונה להודעות שנשלחו — כדי להציג התראה בסוף
    withEmail.forEach(b => {
      this.bookingService.sendMessage(b.id, this.messageSubject, this.messageText)// שולחים הודעה לכל הזמנה עם מייל
        .subscribe({
          next: () => {
            sent++;
            if (sent === withEmail.length) {
              alert(`הודעה נשלחה ל-${sent} הזמנות!`);
              this.sendAllDialog = false;
            }
          }
        });
    });
  }

  // קריאת קובץ מצורף
  onAttachmentChange(event: any) {
    // אם המשתמש בחר קובץ — שומרים אותו, אחרת מאפסים ל-null
    this.attachment = event.target.files[0] || null;
  }

  // חזרה לדשבורד
  goBack() { this.router.navigate(['/dashboard']); }
}