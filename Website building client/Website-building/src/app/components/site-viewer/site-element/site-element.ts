//דף שאחראי על הצגת האתר לגולשים, כולל ניווט בין דפים, הצגת האלמנטים, הוספה לסל וקבלת הזמנות
// site-element.ts
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//שומר את הסל בלוקל סטרג
const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');//שולף את הסל מהלוקל סטרג כשמתחילים, או מערך ריק אם אין נתונים
export const cartSignal = signal<{ name: string; price: number; qty: number }[]>(savedCart);
// פונקציה שמעדכנת את הסל גם ב-signal וגם בלוקל סטרג, כדי לשמור על סנכרון ביניהם
function saveCart(items: any[]) {
  localStorage.setItem('cart', JSON.stringify(items));
  cartSignal.set(items);
}
// פונקציות גלובליות שמוסיפות ומסירות פריטים מהסל, כדי שנוכל לקרוא להן גם מתבניות של קומפוננטות אחרות
export function addToCartGlobal(product: any) {
  const items = cartSignal();// מקבל את רשימת הפריטים הנוכחית מה-signal
  const existing = items.find(i => i.name === product.name);// בודק אם הפריט כבר קיים בסל לפי השם שלו
  if (existing) {
    saveCart(items.map(i => i.name === product.name ? { ...i, qty: i.qty + 1 } : i));
  } else {
    saveCart([...items, { name: product.name, price: Number(product.price), qty: 1 }]);
  }
}

export function removeFromCartGlobal(idx: number) {
  saveCart(cartSignal().filter((_, i) => i !== idx));
}

@Component({
  selector: 'app-site-element',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './site-element.html',
  styleUrl: './site-element.css'
})
export class SiteElementComponent {

  @Input() el!: any;// האלמנט שמוצג — מכיל את כל המידע והתוכן שלו
  @Input() pages: any[] = [];// כל הדפים באתר — משמש לנווט בין דפים אם יש קישורים פנימיים

  @Output() navigate      = new EventEmitter<string>();// משמש לניווט בין דפים בתוך האתר — שולח את ה-slug של הדף שאליו רוצים לעבור
  @Output() submitBooking = new EventEmitter<any>();// משמש לשליחת טופס הזמנה — שולח את הנתונים שהמשתמש מילא בטופס

  Math = Math;

  cartItems = cartSignal;
  addToCart = addToCartGlobal;
  removeFromCart = removeFromCartGlobal;

  cartTotal() {
    return cartSignal().reduce((s, i) => s + i.price * i.qty, 0);
  }

  feedbackId = signal<number | null>(null);
// פונקציה שמציגה משוב ויזואלי קצר על הוספה לסל, על ידי הגדרת feedbackId ל-id של המוצר ולהחזיר אותו ל-null אחרי 2 שניות
  showFeedback(id: number) {
    this.feedbackId.set(id);
    setTimeout(() => this.feedbackId.set(null), 2000);
  }
// נתוני טופס הזמנה ויצירת קשר — מחוברים ל-[(ngModel)] בתבנית
  bookingForm = { name: '', phone: '', date: '', time: '', note: '' };
  bookingSent = false;// האם הטופס הוגש, כדי להציג הודעה למשתמש
  contactForm = { name: '', email: '', message: '' };// נתוני טופס יצירת קשר
  contactSent = false;// האם טופס יצירת הקשר הוגש, כדי להציג הודעה למשתמש
// פונקציה שמטפלת בלחיצה על קישורים בתוך האתר, ומנווטת לפי סוג הקישור (URL חיצוני או דף פנימי)
  onNavClick(link: any) {
    if (link.type === 'url' && link.url) window.open(link.url, '_blank');
    else if (link.page) this.navigate.emit(link.page);
  }
// פונקציה שמטפלת בלחיצה על כפתורים עם פעולות מוגדרות, ומבצעת את הפעולה המתאימה לפי סוגה
  onBtnClick(el: any) {
    if (el.content.linkTo) this.navigate.emit(el.content.linkTo);
  }
// פונקציה שמטפלת בהגשת טופס הזמנה, שולחת את הנתונים לשרת דרך BookingService, ומציגה הודעה על הצלחה או כישלון
  onSubmitBooking() {
    this.submitBooking.emit({ ...this.bookingForm });// שולח עותק של נתוני הטופס כדי לאפשר איפוס הטופס לאחר ההגשה
    this.bookingSent = true;
  }
// פונקציה שמטפלת בהגשת טופס יצירת קשר, שולחת את הנתונים לשרת דרך BookingService, ומציגה הודעה על הצלחה או כישלון
  onSubmitContact() { this.contactSent = true; }
// פונקציה שמחזירה את סגנון הצללה של אלמנט, או 'none' אם אין לו צל
  getShapePath(el: any): string {
    const w = el.width, h = el.height;
    switch (el.shapeType) {
      case 'triangle':      return `M${w/2},0 L${w},${h} L0,${h} Z`;
      case 'triangle-down': return `M0,0 L${w},0 L${w/2},${h} Z`;
      case 'diamond':       return `M${w/2},0 L${w},${h/2} L${w/2},${h} L0,${h/2} Z`;
      case 'star': {
        let d = ''; const cx=w/2,cy=h/2,r1=Math.min(w,h)/2,r2=r1*0.4;
        for(let i=0;i<10;i++){const r=i%2===0?r1:r2;const a=(i*36-90)*Math.PI/180;d+=(i===0?'M':'L')+(cx+r*Math.cos(a))+','+(cy+r*Math.sin(a));}
        return d+'Z';
      }
      case 'heart': {
        const cx=w/2,top=h*0.25;
        return `M${cx},${h*0.85} C${cx-w*0.05},${h*0.7} ${cx-w*0.5},${h*0.55} ${cx-w*0.5},${top} C${cx-w*0.5},${h*0.05} ${cx},${h*0.05} ${cx},${top} C${cx},${h*0.05} ${cx+w*0.5},${h*0.05} ${cx+w*0.5},${top} C${cx+w*0.5},${h*0.55} ${cx+w*0.05},${h*0.7} ${cx},${h*0.85}Z`;
      }
      case 'arrow-right':
        return `M0,${h*0.3} L${w*0.6},${h*0.3} L${w*0.6},0 L${w},${h/2} L${w*0.6},${h} L${w*0.6},${h*0.7} L0,${h*0.7} Z`;
      default: return '';
    }
  }
}