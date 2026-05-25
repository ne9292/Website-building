import { Injectable, signal, computed } from '@angular/core';
import { SiteService } from './site';
import { PageTemplatesService } from './page-templates';
import { CanvasElement, CANVAS_WIDTH } from '../models/canvas.models';
import { getElementDefaults } from './element-defaults';
//CANVAS_WIDTH — רוחב ברירת המחדל של הקנבס, משמש גם בתבניות כדי להתאים את האלמנטים לרוחב המסך
export { CANVAS_WIDTH } from '../models/canvas.models';
export type { CanvasElement, Page, Site, CreateSiteDto } from '../models/canvas.models';// ייצוא של טיפוסים חשובים כדי שלא נצטרך לייבא אותם מכל מקום בנפרד

@Injectable({ providedIn: 'root' })
export class EditorStateService {// שירות שמרכז את כל הלוגיקה והמצב של עורך הדפים
//signal- זה כמו משתנה רגיל, אבל כשאנחנו מעדכנים אותו — כל הקומפוננטות שמשתמשות בו מתעדכנות אוטומטית.
  siteId         = signal<number>(0);// האתר הנוכחי שנערוך
  site           = signal<any>(null);// פרטי האתר (שם, צבעים וכו') — נטען מהשרת
  pages          = signal<any[]>([]);// כל הדפים באתר — נטען מהשרת
  selectedPage   = signal<any>(null);// הדף הנוכחי שנערוך
  elements       = signal<CanvasElement[]>([]);// כל האלמנטים על הקנבס בדף הנוכחי
  selectedEl     = signal<CanvasElement | null>(null);// האלמנט הנבחר כרגע (לעריכה)
  editingTextId  = signal<number | null>(null);// אם אנחנו בעריכת טקסט — זהו ה-id של האלמנט, אחרת null
  isSaving       = signal<boolean>(false);//האם כרגע מתבצעת שמירה לשרת
  saveSuccess    = signal<boolean | null>(null);// null = עדיין לא שמרנו | true = השמירה האחרונה הצליחה | false = השמירה האחרונה נכשלה
  showPagePicker = signal<boolean>(false);// האם להציג את חלון בחירת התבנית כשיוצרים דף חדש
  cartItems      = signal<{ name: string; price: number; qty: number }[]>([]);// פריטים בעגלת קניות (אם יש) — משמש לדף חנות

  private idCounter = Date.now();// מונה פשוט ליצירת id ייחודי לאלמנטים חדשים — מבוסס על הזמן הנוכחי כדי להבטיח ייחודיות גם אחרי רענון הדף
  private history: CanvasElement[][] = [];// היסטוריית שינויים של האלמנטים — כל פעם שמעדכנים את האלמנטים, שומרים עותק ב-history כדי לאפשר undo
// computed — כמו signal, אבל מבוסס על ערכים אחרים. כאן אנחנו ממיינים את האלמנטים לפי zIndex כדי להציג אותם בסדר הנכון על הקנבס
  sortedElements = computed(() =>
    [...this.elements()].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
  );

  constructor(
    private siteService: SiteService,
    private pageTemplates: PageTemplatesService
  ) {
    window.addEventListener('beforeunload', () => this.savePage());// כשמשתמש מנסה לסגור או לרענן את הדף — שומרים אוטומטית את השינויים כדי לא לאבד עבודה
  }

  // ===== אתחול =====

  init(siteId: number) {
    // איפוס כל המצב לפני טעינת האתר והדפים — כדי למנוע זליגת מידע בין אתרים שונים אם המשתמש עובר ביניהם בלי לרענן את הדף
    this.elements.set([]);
    this.selectedEl.set(null);
    this.editingTextId.set(null);
    this.selectedPage.set(null);
    this.pages.set([]);
    this.history = [];
    this.siteId.set(siteId);
// טוענים את פרטי האתר כדי להציג אותם ב-dashboard
    this.siteService.getSites().subscribe({
      next: (sites) => this.site.set(sites.find(s => s.id === siteId) ?? null)
    });
// טוענים את הדפים של האתר — ברגע שהם נטענים, בוחרים אוטומטית בדף הראשון (אם יש) כדי לטעון את האלמנטים שלו
    this.siteService.getPages(siteId).subscribe({
      next: (pages) => {
        this.pages.set(pages);
        if (pages.length > 0) this.selectPage(pages[0]);
      }
    });
  }

  // ===== דפים =====

  selectPage(page: any) {
    const currentPage     = this.selectedPage();// הדף הנוכחי לפני השינוי — כדי שנוכל לשמור את השינויים שלו לפני הטעינה של הדף החדש
    const currentElements = this.elements();// האלמנטים הנוכחיים על הקנבס לפני השינוי
// אם יש דף נבחר כרגע ויש עליו אלמנטים — שומרים את השינויים שלו לפני הטעינה של הדף החדש
    if (currentPage && currentElements.length > 0) {  
      this.pages.update(ps => ps.map(p =>// מעדכנים רק את הדף הנוכחי עם האלמנטים החדשים, שאר הדפים נשארים כפי שהם
        p.id === currentPage.id
          ? { ...p, sections: [{ contentJson: JSON.stringify(currentElements) }] }//עדכון האלמנטים בדף הנוכחי עם השינויים החדשים
          : p
      ));
      this._doSave(false, currentPage, currentElements);// שולחים את השינויים לשרת — אבל לא מציגים התראה למשתמש 
    }
// עכשיו טוענים את הדף החדש שבחר המשתמש, מאפסים את האלמנטים והאלמנט הנבחר, ומטעינים את האלמנטים של הדף החדש אם יש
    this.selectedPage.set(page);
    this.selectedEl.set(null);
    this.editingTextId.set(null);
    this.history = [];
    if (page?.sections?.length > 0 && page.sections[0].contentJson) {// אם יש בדף החדש אלמנטים שמורים — טוענים אותם לקנבס
      try {
        // מכיוון שהאלמנטים נשמרים כטקסט JSON בשרת, אנחנו צריכים לפרסר אותם בחזרה לאובייקטים של JavaScript כדי להשתמש בהם בעורך
        const loaded = JSON.parse(page.sections[0].contentJson);
        setTimeout(() => {// משתמשים ב-setTimeout כדי לוודא שהקנבס כבר נטען לפני שאנחנו מנסים להמיר את האלמנטים ליחידות של פיקסלים
          const canvasWidth = this.getCanvasWidth();// בודקים את רוחב הקנבס כדי להתאים את האלמנטים ליחידות של פיקסלים במקום אחוזים
          const converted = loaded.map((el: any) => this.elementFromPercent(el, canvasWidth));// מבצעים את ההמרה של כל אלמנט מהיחידות של אחוזים ליחידות של פיקסלים
          this.elements.set(this.clampLoadedElements(converted));// בסיום כל ההמרות וההתאמות — טוענים את האלמנטים המעודכנים לסטייט כדי להציג אותם על הקנבס
        }, 50);
      } catch {
        this.elements.set([]);
      }
    } else {
      this.elements.set([]);
    }
  }

  addPage(type: any) {//הוספת דף
    const p = {
      title: type.label,// שם הדף יהיה לפי סוג התבנית שנבחרה (בית, אודות, חנות וכו')
      slug: type.id + '-' + Date.now(),// יצירת slug ייחודי על ידי שילוב של סוג התבנית עם טיימסטמפ
      isHome: this.pages().length === 0// אם זה הדף הראשון שנוצר — מסמנים אותו כדף הבית כברירת מחדל
    };
    //הוספה בשרת
    this.siteService.createPage(this.siteId(), p).subscribe({
      next: (page) => {
        this.pages.update(ps => [...ps, page]);// הוספת הדף החדש לסטייט
        this.selectPage(page);// בחירת הדף החדש כדי לטעון אותו לעורך
        this.showPagePicker.set(false);// הסתרת חלון בחירת התבנית אחרי יצירת הדף
        if (type.id !== 'blank') {// אם התבנית שנבחרה היא לא ריקה — מיישמים את התבנית על הדף החדש כדי למלא אותו באלמנטים מוכנים מראש
          setTimeout(() => this.pageTemplates.apply(type.id, this), 100);
        }
      }
    });
  }
// מחיקת דף
  deletePage(pageId: number) {
    if (!confirm('למחוק את הדף?')) return;
    this.siteService.deletePage(this.siteId(), pageId).subscribe({
      next: () => {
        // אחרי שמחקנו את הדף בשרת, אנחנו צריכים לעדכן את הסטייט כדי להסיר אותו מהרשימה ולבחור דף אחר אם הדף שנמחק היה הדף הנבחר כרגע
        const remaining = this.pages().filter(p => p.id !== pageId);
        this.pages.set(remaining);
        this.selectPage(remaining[0] ?? null);
      }
    });
  }

  // ===== אלמנטים =====
  // הוספת אלמנט חדש לקנבס — נקראת כשמשתמש בוחר כלי מהתפריט הצדדי או כשמיישמים תבנית עם אלמנטים מוכנים מראש
  addElement(tool: any, x?: number, y?: number): CanvasElement {
    this.saveHistory();
    const maxZ = this.elements().length > 0//שומרים את השכבה הגבוהה של האלמנט
      ? Math.max(...this.elements().map(e => e.zIndex || 0)) : 0;

    const inner = document.querySelector('.canvas-inner') as HTMLElement;// בודקים את רוחב הקנבס כדי לוודא שהאלמנט לא ייווצר מחוץ לגבולות הימניים שלו
    const canvasWidth = inner?.offsetWidth ?? CANVAS_WIDTH;// אם לא מצליחים למצוא את האלמנט — נופשים לרוחב ברירת המחדל

    const safeX = Math.min(// מוודא שה-x לא פחות מ-0 ולא יותר מרוחב הקנבס פחות הרוחב של האלמנט
      Math.max(0, x ?? (80 + (this.elements().length % 6) * 18)),
      canvasWidth - (tool.defaultW || 100)// אם הכלי לא מגדיר רוחב ברירת מחדל, נניח 100 פיקסלים
    );
    const safeY = Math.max(0, y ?? (80 + (this.elements().length % 6) * 18));//שומר את הרוחב המקסימלי
// עכשיו אנחנו יכולים ליצור את האלמנט החדש עם הקואורדינטות הבטוחות, השכבה הנכונה, וההגדרות המחדליות לפי סוגו
    const el: CanvasElement = {
      id: this.idCounter++,
      type: tool.id || 'shape',
      label: tool.label,
      x: safeX, y: safeY,//שומרים את התוצאות של הרוחב והאורך
      width: tool.defaultW, height: tool.defaultH,//שומרים את הרוחב והאורך שהכלי מגדיר כברירת מחדל
      zIndex: maxZ + 1,//עכשיו הוא בשכבה הכי גבוה
      opacity: 1,// ברירת מחדל של שקיפות מלאה
      shadow: false,// ברירת מחדל של ללא צל
      shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 12, shadowX: 4, shadowY: 4,
      border: { width: 0, color: '#f97316', style: 'solid', radius: 0 },
      content: getElementDefaults(tool.id || 'shape', tool.shapeType),// הגדרות מחדל לפי סוג האלמנט (טקסט, תמונה, כפתור וכו') — פונקציה נפרדת שמחזירה אובייקט עם ההגדרות המתאימות לכל סוג
      ...(tool.shapeType ? { shapeType: tool.shapeType } : {})
    };
// מוסיפים את האלמנט החדש לסטייט, בוחרים אותו כדי להציג את אפשרויות העריכה שלו, ומחזירים אותו למקרה שהקריאה רוצה לעשות משהו נוסף איתו
    this.elements.update(els => [...els, el]);
    this.selectedEl.set(el);
    return el;
  }
// בחירת אלמנט על הקנבס — נקראת כשמשתמש לוחץ על אלמנט כדי לערוך אותו
  selectElement(el: CanvasElement) { this.editingTextId.set(null); this.selectedEl.set(el); }
// ביטול בחירת אלמנט — נקראת כשמשתמש לוחץ מחוץ לכל אלמנט או בוחר אלמנט אחר
  deselectAll() { this.selectedEl.set(null); this.editingTextId.set(null); }
// מחיקת אלמנט — נקראת כשמשתמש לוחץ על כפתור המחיקה בתפריט העריכה של האלמנט
  deleteElement(id: number) {
    this.saveHistory();
    this.elements.update(els => els.filter(e => e.id !== id));
    if (this.selectedEl()?.id === id) this.selectedEl.set(null);
  }
// שכפול אלמנט — נקראת כשמשתמש לוחץ על כפתור השכפול בתפריט העריכה של האלמנט
  duplicateElement(el: CanvasElement) {
    this.saveHistory();
    const copy: CanvasElement = {
      ...JSON.parse(JSON.stringify(el)),
      id: this.idCounter++,
      x: el.x + 20, y: el.y + 20,// הזזה קלה של האלמנט החדש כדי שלא יהיה בדיוק מעל המקורי
      zIndex: (el.zIndex || 0) + 1
    };
    this.elements.update(els => [...els, copy]);// מוסיפים את העותק לסטייט
    this.selectedEl.set(copy);
  }
// עדכון חלקי של אלמנט — נקראת כשמשתמש משנה תכונה מסוימת של האלמנט (למשל צבע, גודל, טקסט וכו') כדי לעדכן רק את התכונה הזו בלי לגעת בשאר התכונות של האלמנט
  patchElement(id: number, patch: Partial<CanvasElement>) {
    this.elements.update(els => els.map(e => e.id === id ? { ...e, ...patch } : e));// מעדכנים את האלמנט המתאים עם התכונות החדשות, שאר האלמנטים נשארים כפי שהם
    if (this.selectedEl()?.id === id) {// אם האלמנט שאנחנו מעדכנים הוא גם האלמנט הנבחר כרגע — אנחנו צריכים לעדכן את selectedEl כדי שהשינויים יופיעו מיד בתפריט העריכה שלו
      this.selectedEl.update(el => el ? { ...el, ...patch } : el);
    }
  }

  // ===== שכבות =====
// פונקציות שמאפשרות לשנות את סדר השכבות של האלמנטים על הקנבס — נקראות כשמשתמש לוחץ על כפתורי "העלה שכבה", "הורד שכבה" וכו' בתפריט העריכה של האלמנט
  bringToFront(el: CanvasElement) {
    this.saveHistory();
    const maxZ = Math.max(...this.elements().map(e => e.zIndex || 0));//שומר את השכבה הכי גבוהה כרגע כדי להעלות את האלמנט הנבחר מעליה
    this.patchElement(el.id, { zIndex: maxZ + 1 });
  }
  // במקום להעלות את האלמנט ישירות לשכבה הכי גבוהה, אנחנו יכולים להעלות אותו רק בשכבה אחת כדי לשמור על הסדר היחסי של האלמנטים האחרים
  bringForward(el: CanvasElement)  { this.saveHistory(); this.patchElement(el.id, { zIndex: (el.zIndex || 0) + 1 }); }
  // בדומה להורדת שכבה, אנחנו יכולים להוריד את האלמנט רק בשכבה אחת כדי לשמור על הסדר היחסי של האלמנטים האחרים
  sendBackward(el: CanvasElement)  { this.saveHistory(); this.patchElement(el.id, { zIndex: Math.max(0, (el.zIndex || 0) - 1) }); }
  sendToBack(el: CanvasElement) {
    this.saveHistory();
    const minZ = Math.min(...this.elements().map(e => e.zIndex || 0));
    this.patchElement(el.id, { zIndex: minZ - 1 });
  }

  // ===== היסטוריה =====
// פונקציות שמאפשרות לשמור את היסטוריית השינויים של האלמנטים כדי לאפשר למשתמש לחזור אחורה (undo) אם הוא עשה טעות או רוצה לבטל שינוי מסוים
  saveHistory() {
    // לפני שמעדכנים את האלמנטים, אנחנו שומרים עותק של המצב הנוכחי שלהם ב-history. אנחנו משתמשים ב-JSON כדי ליצור עותק עמוק של המערך והאובייקטים שבתוכו, כדי לוודא שהשינויים הבאים לא ישפיעו על ההיסטוריה השמורה.
    this.history.push(JSON.parse(JSON.stringify(this.elements())));
    if (this.history.length > 40) this.history.shift();//אם האורך גדול משלושים — אנחנו מסירים את השינוי הכי ישן כדי לא לגדול יותר מדי ולפגוע בביצועים
  }
// פונקציה שמאפשרת לחזור לשינוי הקודם על ידי טעינת המצב האחרון מההיסטוריה. אנחנו גם מאפסים את האלמנט הנבחר כדי למנוע בעיות של בחירת אלמנט שלא קיים יותר אחרי החזרה אחורה.
  undo() {
    if (!this.history.length) return;
    this.elements.set(this.history.pop()!);// טוענים את המצב האחרון של האלמנטים מההיסטוריה
    this.selectedEl.set(null);// מאפסים את האלמנט הנבחר כדי למנוע בעיות של בחירת אלמנט שלא קיים יותר אחרי החזרה אחורה
  }

  // ===== שמירה =====
//פונקציה של שמירת עמוד 
  savePage() { this._doSave(true); }

  private _doSave(withFeedback: boolean, pageOverride?: any, elementsOverride?: CanvasElement[]) {//מפרידים, כדי שיוכלו לקרוא לה גם בפעמים אחרות
    const page     = pageOverride     ?? this.selectedPage();// הדף שאנחנו רוצים לשמור — ברירת המחדל היא הדף הנבחר כרגע
    const elements = elementsOverride ?? this.elements();// האלמנטים שאנחנו רוצים לשמור — ברירת המחדל היא האלמנטים הנוכחיים על הקנבס
    if (!page) return;
//בודק אם להציג את השומר...
    if (withFeedback) { this.isSaving.set(true); this.saveSuccess.set(null); }

    const canvasWidth = this.getCanvasWidth();//רוחב הקנבס כדי להמיר לאחוזים בחזרה
    const contentJson = JSON.stringify(elements.map(el => this.elementToPercent(el, canvasWidth)));//פונקציה שמבצעת את ההמרה elementToPercent 
    const body = {//מבנה הנתונים ששולחים לשרת
      title: page.title, slug: page.slug, isHome: page.isHome,
      sections: [{ type: 'canvas', contentJson, orderIndex: 0 }]
    };
//שמירה סופית
    this.siteService.updatePage(this.siteId(), page.id, body).subscribe({
      next: () => {
        this.pages.update(ps => ps.map(p =>
          p.id === page.id ? { ...p, sections: [{ contentJson }] } : p
        ));
        if (withFeedback) {
          this.isSaving.set(false);
          this.saveSuccess.set(true);
          setTimeout(() => this.saveSuccess.set(null), 2500);
        }
      },
      error: () => {
        if (withFeedback) { this.isSaving.set(false); this.saveSuccess.set(false); }
      }
    });
  }

  // ===== עגלת קניות =====
  addToCart(product: any) {
    //מחפש את המוצר הרצוי בעגלה
    const existing = this.cartItems().find(i => i.name === product.name);
    if (existing) {//אם קיים נעלה בכמות ואם לו נוסיף את המוצר
      this.cartItems.update(items => items.map(i =>
        i.name === product.name ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      this.cartItems.update(items => [...items, { name: product.name, price: Number(product.price), qty: 1 }]);
    }
  }
  // פונקציה שמסירה מוצר מהעגלה על ידי סינון שלו מתוך רשימת הפריטים בעגלה לפי האינדקס שלו
  removeFromCart(idx: number) { this.cartItems.update(items => items.filter((_, i) => i !== idx)); }
  // פונקציה שמחשבת את הסכום הכולל של הפריטים בעגלה על ידי חיבור של המחיר כפול הכמות של כל פריט
  cartTotal() { return this.cartItems().reduce((s, i) => s + i.price * i.qty, 0); }

  // ===== פרסום אתר =====
  setPublished(isPublished: boolean) {
    this.siteService.publishSite(this.siteId(), isPublished).subscribe({//שולח בקשה לשרת לעדכן את סטטוס הפרסום של האתר
      next: () => this.site.update(s => s ? { ...s, isPublished } : s),
      error: () => alert(isPublished ? 'פרסום האתר נכשל' : 'ביטול הפרסום נכשל')
    });
  }

  // ===== Navbar גלובלי =====
//שהנב יהיה בכל הדפים
  applyNavbarToAllPages(navbar: CanvasElement) {
    const pages = this.pages();// שומרים את הדף הנוכחי כדי שנוכל לחזור אליו אחרי העדכון של כל הדפים
    const currentPage = this.selectedPage();
//לולאה שעוברת על כל הדפים
    pages.forEach(page => {
      let elements: CanvasElement[] = [];// מנסה לטעון את האלמנטים הקיימים של הדף — אם יש — כדי לא למחוק אותם, אלא רק להוסיף את הנב בראש הרשימה
      if (page.sections?.[0]?.contentJson) {// אם יש בדף אלמנטים שמורים — מנסים לפרסר אותם כדי לקבל את המערך של האלמנטים הקיימים
        try { elements = JSON.parse(page.sections[0].contentJson); } catch {}
      }
      //מסירים נב קיים
      elements = elements.filter(e => e.type !== 'navbar');
      // מוסיפים את הנב החדש בראש הרשימה כדי שהוא יהיה מעל כל האלמנטים האחרים בדף
      //זה נקרא העתקה עמוקה- שכל אובייקט הוא בפני עצמו ולא תלוי באחרים
      //זה נוצר עי שהפכנו למחרוזת והפכנו בחזרה לאובייקט
      elements.unshift({ ...JSON.parse(JSON.stringify(navbar)), id: Date.now() + Math.random() });
      this._doSave(false, page, elements);//שמירה
      this.pages.update(ps => ps.map(p =>// מעדכנים את הדף עם האלמנטים החדשים, שאר הדפים נשארים כפי שהם
        p.id === page.id ? { ...p, sections: [{ contentJson: JSON.stringify(elements) }] } : p
      ));
    });
// אחרי שעידכנו את כל הדפים, אנחנו בוחרים מחדש בדף הנוכחי כדי לטעון את השינויים שלו עם הנב החדש
    if (currentPage) this.selectPage(currentPage);
  }

  // ===== המרות קואורדינטות =====
// מאחר שהאלמנטים נשמרים בשרת עם קואורדינטות באחוזים כדי להתאים לכל רוחב מסך, אנחנו צריכים להמיר אותם לפיקסלים כשאנחנו טוענים אותם לקנבס, ולהיפך כשאנחנו שומרים אותם לשרת. הפונקציות הבאות מבצעות את ההמרות האלה בהתחשב ברוחב הקנבס הנוכחי.
  private getCanvasWidth(): number {//פונקציה שמחזירה את רוחב הקנבס
    const inner = document.querySelector('.canvas-inner') as HTMLElement;// בודקים את רוחב הקנבס על ידי גישה ל-HTMLElement שלו, ואם לא מצליחים למצוא אותו (למשל אם הקומפוננטה של הקנבס עדיין לא נטענה) — נופשים לרוחב ברירת המחדל
    return inner?.offsetWidth ?? CANVAS_WIDTH;
  }

  private elementToPercent(el: CanvasElement, canvasWidth: number): any {//פונקציה שממירה מפיקסלים לאחוזים
    return { ...el, x: el.x / canvasWidth * 100, width: el.width / canvasWidth * 100, _isPercent: true };
  }

  private elementFromPercent(el: any, canvasWidth: number): CanvasElement {//פונקציה שממירה מאחוזים לפיקסלים
    if (!el._isPercent) return el;
    const { _isPercent, ...rest } = el;// הסרת השדה _isPercent כי הוא רק לסימון ולא צריך להיות חלק מהאלמנט עצמו
    return { ...rest, x: Math.round(el.x / 100 * canvasWidth), width: Math.round(el.width / 100 * canvasWidth) };// המרת ה-x וה-width מפיקסלים לאחוזים בהתחשב ברוחב הקנבס, ועיגול התוצאות כדי לקבל מספרים שלמים של פיקסלים
  }
//פונקציה שבודקת שאין גלישה של האלמנטים למחוץ לקנבס
  private clampLoadedElements(els: CanvasElement[]): CanvasElement[] {
    const inner = document.querySelector('.canvas-inner') as HTMLElement;// בודקים את רוחב הקנבס כדי לוודא שהאלמנטים לא ייווצרו מחוץ לגבולות הימניים שלו, אם לא מצליחים למצוא את האלמנט — נופשים לרוחב ברירת המחדל
    const canvasWidth = inner?.offsetWidth ?? CANVAS_WIDTH;
    return els.map(el => ({
      ...el,
      x: Math.min(Math.max(0, el.x), canvasWidth - el.width),
      y: Math.max(0, el.y)
    }));
  }
}
