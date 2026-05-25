// שירות שמכיל תבניות מוכנות מראש לסוגי דפים שונים (בית, אודות, חנות וכו')
import { Injectable } from '@angular/core';
import { EditorStateService, CANVAS_WIDTH } from './editor-state.service';

// הגדרת ה"צורה" של פונקציית העזר כדי ש-TypeScript לא יכעס
type AddFn = (toolId: string, x: number, y: number, w: number, h: number, overrides?: any) => void;

@Injectable({ providedIn: 'root' })
export class PageTemplatesService {

  // הפונקציה הראשית שמופעלת כשיוצרים דף חדש
  apply(typeId: string, state: EditorStateService) {
    // 1. בודקים פיזית בדפדפן מה רוחב הקנבס כרגע
    const canvasInner = document.querySelector('.canvas-inner') as HTMLElement;
    const W = canvasInner ? canvasInner.clientWidth : CANVAS_WIDTH;// אם לא מצליחים למצוא את האלמנט — נופשים לרוחב ברירת המחדל

    // . פונקציית עזר פנימית שחוסכת לנו כתיבה כפולה
    const add: AddFn = (toolId, x, y, w, h, overrides = {}) => {
      // מוודא שהרוחב לא חורג מהצד הימני של המסך
      const safeW = Math.min(w, W - x);
      // מכין אובייקט "כלי" זמני כדי לשלוח ל-Service השני
      const tool = { id: toolId, label: toolId, defaultW: safeW, defaultH: h };
      
      // כאן קורה החיבור: אנחנו קוראים ל-Service הראשי שיוסיף אלמנט עם כל הדיפולטים שלו
      const el = state.addElement(tool, x, y);
      
      // כאן אנחנו "מזריקים" רק את השינויים (כמו טקסט) בלי לגעת בצבעים (אלא אם נרצה)
      Object.assign(el.content, overrides);
    };

    // 3. ה"מרכזיה" - שולחת לכל תבנית לפי הסוג שנבחר
    switch (typeId) {
      case 'home':    this.home(add, W);    break;    // דף בית
      case 'about':   this.about(add, W);   break;    // דף אודות
      case 'store':   this.store(add, W);   break;    // דף חנות
      case 'gallery': this.gallery(add, W); break;    // דף גלריה
      case 'contact': this.contact(add, W); break;    // דף צור קשר
      case 'blank':   /* דף ריק - לא עושים כלום */ break; 
    }
  }

  // --- רכיבים שחוזרים על עצמם ---

  private navbar(add: AddFn, W: number) {
    // מוסיף תפריט עליון - לוקח צבעים מה-EditorState
    add('navbar', 0, 0, W, 60, { siteName: 'האתר שלי' });
  }

  private footer(add: AddFn, W: number, y: number) {
    // מוסיף פוטר (משתמש באלמנט about כבסיס) במיקום Y שקיבל
    add('about', 0, y, W, 200, { businessName: 'כל הזכויות שמורות' });
  }

  // --- 1. תבנית דף בית (Home) ---
  private home(add: AddFn, W: number) {
    this.navbar(add, W); // מוסיף תפריט
    add('hero', 0, 70, W, 350, { title: 'ברוכים הבאים', subtitle: 'הדף נבנה אוטומטית' }); // תמונת פתיחה
    add('button', W * 0.4, 450, 180, 50, { label: 'קרא עוד' }); // כפתור במרכז
    this.footer(add, W, 600); // מוסיף סיומת
  }

  // --- 2. תבנית אודות (About) ---
  private about(add: AddFn, W: number) {
    this.navbar(add, W);
    add('hero', 0, 70, W, 250, { title: 'עלינו', subtitle: 'הסיפור מאחורי העסק' });
    add('text', W * 0.1, 350, W * 0.8, 120, { text: 'אנחנו חברה מקצועית שנוסדה בשנת...' }); // טקסט ארוך
    this.footer(add, W, 550);
  }

  // --- 3. תבנית חנות (Store) ---
  private store(add: AddFn, W: number) {
    this.navbar(add, W);
    add('text', 0, 80, W, 40, { text: 'המוצרים החדשים שלנו', align: 'center' });
    // 3 מוצרים בשורה אחת - החישוב מוודא שהם יכנסו ברוחב W
    add('product', 0, 140, W * 0.3, 280, { name: 'מוצר א', price: 99 });
    add('product', W * 0.35, 140, W * 0.3, 280, { name: 'מוצר ב', price: 149 });
    add('product', W * 0.7, 140, W * 0.3, 280, { name: 'מוצר ג', price: 199 });
    add('cart', 0, 450, W, 180, { title: 'עגלת הקניות' }); // אלמנט סל קניות
    this.footer(add, W, 700);
  }

  // --- 4. תבנית גלריה (Gallery) ---
  private gallery(add: AddFn, W: number) {
    this.navbar(add, W);
    add('text', 0, 80, W, 50, { text: 'גלריית עבודות', align: 'center' });
    add('gallery', 0, 150, W, 400, { layout: 'grid' }); // אלמנט גלריה ריק
    this.footer(add, W, 600);
  }

  // --- 5. תבנית צור קשר (Contact) ---
  private contact(add: AddFn, W: number) {
    this.navbar(add, W);
    add('hero', 0, 70, W, 150, { title: 'צרו קשר' });
    add('contact', W * 0.25, 250, W * 0.5, 350, { title: 'נשמח לעזור' }); // טופס יצירת קשר
    this.footer(add, W, 650);
  }
}