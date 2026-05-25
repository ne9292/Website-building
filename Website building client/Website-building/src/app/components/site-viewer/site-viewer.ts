// site-viewer.ts — פשוט, ללא scale/zoom/ratio
// x ו-width מגיעים מהDB כאחוזים (אחרי השינוי ב-editor-state.service.ts)
// ומוצגים ישר כאחוזים → מתאים לכל מסך אוטומטית
//דף שאחראי על הצגת האתר לגולשים, כולל ניווט בין דפים, הצגת האלמנטים, הוספה לסל וקבלת הזמנות

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../services/site';
import { BookingService } from '../../services/booking.service';
import { SiteElementComponent } from './site-element/site-element';

@Component({
  selector: 'app-site-viewer',
  standalone: true,
  imports: [CommonModule, SiteElementComponent],
  templateUrl: './site-viewer.html',
  styleUrl: './site-viewer.css'
})
export class SiteViewerComponent implements OnInit {

  site        = signal<any>(null);// האתר כולו — כולל מידע על כל הדפים, הלוגו וכו'
  pages       = signal<any[]>([]);// כל הדפים באתר — משמש לנווט בין דפים ולטעון תוכן
  currentPage = signal<any>(null);// הדף הנוכחי שמוצג — מכיל את המידע והתוכן של הדף שמוצג כרגע
  elements    = signal<any[]>([]);// האלמנטים של הדף הנוכחי — ממוינים לפי zIndex כדי להציג אותם בסדר הנכון
  loading     = signal(true);// מציג "טוען..." בזמן שהאתר נטען מהשרת
  notFound    = signal(false);// אם הכתובת לא תקינה או שיש בעיה בטעינת האתר, מציג "האתר לא נמצא"
  cartItems   = signal<{ name: string; price: number; qty: number }[]>([]);// פריטים שנוספו לעגלת הקניות באתר

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private siteService:    SiteService,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    const subdomain = this.route.snapshot.paramMap.get('subdomain');// ה-subdomain הוא מזהה האתר בכתובת, למשל בכתובת mysite.example.com זה יהיה "mysite"
    const pageSlug  = this.route.snapshot.paramMap.get('pageSlug');// ה-pageSlug הוא מזהה הדף בתוך האתר, למשל בכתובת mysite.example.com/about זה יהיה "about"

    if (!subdomain) { this.notFound.set(true); this.loading.set(false); return; }// אם אין subdomain בכתובת, לא ניתן לטעון אתר — מציג "האתר לא נמצא" ומפסיק את הטעינה
// טוען את האתר מהשרת לפי ה-subdomain, ומטפל בתגובה או בשגיאה
    this.siteService.getSiteBySubdomain(subdomain).subscribe({
      next: (site) => {
        if (!site) { this.notFound.set(true); this.loading.set(false); return; }
        this.site.set(site);// שומר את כל מידע האתר ב-signal כדי שנוכל להשתמש בו בתבנית ובפונקציות אחרות
        const pages = site.pages ?? [];// מקבל את רשימת הדפים מהאתר, או מערך ריק אם אין דפים
        this.pages.set(pages);
        const page = pageSlug// אם יש pageSlug בכתובת, מנסה למצוא את הדף המתאים לפי ה-slug שלו
          ? pages.find((p: any) => p.slug === pageSlug)
          : pages.find((p: any) => p.isHome) || pages[0];
        if (page) this.loadPage(page);// אם נמצא דף מתאים, טוען את תוכנו ואלמנטיו
        else this.notFound.set(true);
        this.loading.set(false);
      },
      error: () => { this.notFound.set(true); this.loading.set(false); }
    });
  }
//פונקציה שמטפלת בטעינת דף
  loadPage(page: any) {
    this.currentPage.set(page);
    if (page?.sections?.length > 0 && page.sections[0].contentJson) {
      try {
        const els = JSON.parse(page.sections[0].contentJson);// מפענח את ה-JSON של תוכן הדף כדי לקבל את האלמנטים שלו
        this.elements.set([...els].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)));// מסדר את האלמנטים לפי zIndex כדי להציג אותם בסדר הנכון (אלמנטים עם zIndex גבוה יותר יהיו מעל אחרים)
      } catch (e) {
        console.error('שגיאה בטעינת תוכן הדף:', e);
        this.elements.set([]);
      }
    } else {
      this.elements.set([]);
    }
  }
//פונקציה שמטפךת בניווט בין דפים
  navigateTo(slug: string) {
    // משנה את הכתובת בדפדפן לכתובת של הדף החדש, ומטען את תוכנו
    const subdomain = this.route.snapshot.paramMap.get('subdomain');
    this.router.navigate(['/site', subdomain, slug]);// לאחר שינוי הכתובת, ה-ngOnInit יטען את הדף המתאים לפי ה-slug החדש
    const page = this.pages().find(p => p.slug === slug);// מחפש את הדף המתאים לפי ה-slug שלו
    if (page) this.loadPage(page);// אם נמצא דף מתאים, טוען את תוכנו ואלמנטיו
  }

  // x ו-width הם אחוזים (נשמרו כך ב-editor-state) — מחזיר עם %
  toPercX(x: number): string { return x + '%'; }
  toPercW(w: number): string { return w + '%'; }
// מחזיר את הגובה של הקנבס לפי האלמנטים שבו, כדי שהקנבס יתארך אוטומטית לפי התוכן
  get canvasHeight(): number {
    const els = this.elements();
    if (!els.length) return 600;
    return Math.max(...els.map(e => e.y + e.height)) + 80;
  }
// מחזיר את סגנון הצללה של אלמנט, או 'none' אם אין לו צל
  shadowStyle(el: any): string {
    if (!el.shadow) return 'none';
    return `${el.shadowX}px ${el.shadowY}px ${el.shadowBlur}px ${el.shadowColor}`;// דוגמה: '5px 5px 10px rgba(0,0,0,0.5)'
  }
//פונקציה  שמוסיפה את האלמנט לעגלת הקניות ומציגה משוב ויזואלי קצר על כך
  addToCart(product: any) {
    const existing = this.cartItems().find(i => i.name === product.name);
    if (existing) {
      this.cartItems.update(items => items.map(i =>
        i.name === product.name ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      this.cartItems.update(items => [
        ...items,
        { name: product.name, price: Number(product.price), qty: 1 }
      ]);
    }
  }
  // פונקציה שמסירה פריט מעגלת הקניות לפי האינדקס שלו, ומעדכנת את רשימת הפריטים
  removeFromCart(idx: number) { this.cartItems.update(items => items.filter((_, i) => i !== idx)); }
  // פונקציה שמחשבת את הסכום הכולל של הפריטים בעגלת הקניות, על ידי סכימת המחיר כפול הכמות של כל פריט
  cartTotal() { return this.cartItems().reduce((s, i) => s + i.price * i.qty, 0); }
// פונקציה שמטפלת בהגשת טופס הזמנה, שולחת את הנתונים לשרת דרך BookingService, ומציגה הודעה על הצלחה או כישלון
  submitBooking(data: any) {
    const site = this.site();
    if (!site) return;
    this.bookingService.createBooking({ ...data, siteId: site.id }).subscribe({
      next: () => alert('ההזמנה נשלחה בהצלחה!'),
      error: () => alert('שגיאה בשליחת ההזמנה')
    });
  }
}