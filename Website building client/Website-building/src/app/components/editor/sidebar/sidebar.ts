// ============================================================
// sidebar.ts
// מיקום: src/app/components/editor/sidebar/sidebar.ts
// ============================================================
// סרגל הכלים הימני — מציג רכיבים, מאפיינים, שכבות ודפים.
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStateService } from '../../../services/editor-state.service';
import { FormatBarComponent } from './format-bar/format-bar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatBarComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {

  activeTab: 'elements' | 'design' | 'layers' | 'pages' = 'elements';// הטאב הפעיל בסרגל הצד
  searchQuery    = '';// מחרוזת החיפוש לרכיבים בסרגל הצד
  showShapePicker = false;// האם להציג את בורר הצורות הגיאומטריות

  // ===== קבוצות כלים =====
  toolGroups = [
    {
      label: 'בסיסיים',
      tools: [
        { id: 'text',    label: 'טקסט',       desc: 'פסקה / כותרת',   defaultW: 300, defaultH: 80  },
        { id: 'image',   label: 'תמונה',       desc: 'לחץ/גרור',       defaultW: 300, defaultH: 200 },
        { id: 'button',  label: 'כפתור',       desc: '4 סגנונות',      defaultW: 160, defaultH: 50  },
        { id: 'hero',    label: 'Hero Banner', desc: 'כותרת + רקע',    defaultW: 780, defaultH: 340 },
      ]
    },
    {
      label: 'מבנה',
      tools: [
        { id: 'navbar',  label: 'Navbar',  desc: 'ניווט + קישורים', defaultW: 780, defaultH: 60 },
        { id: 'divider', label: 'מפריד',   desc: 'קו הפרדה',        defaultW: 600, defaultH: 4  },
        { id: 'spacer',  label: 'ריווח',   desc: 'מרחב ריק',        defaultW: 400, defaultH: 60 },
      ]
    },
    {
      label: 'מדיה',
      tools: [
        { id: 'gallery',      label: 'גלריה',    desc: 'תמונות מרובות', defaultW: 600, defaultH: 220 },
        { id: 'video',        label: 'וידאו',     desc: 'מהמחשב / URL',  defaultW: 500, defaultH: 300 },
        { id: 'pdf',          label: 'PDF',       desc: 'הצגת מסמך',     defaultW: 500, defaultH: 400 },
        { id: 'pdf-download', label: 'הורדת PDF', desc: 'כפתור הורדה',   defaultW: 200, defaultH: 50  },
      ]
    },
    {
      label: 'חנות',
      tools: [
        { id: 'product', label: 'מוצר',     desc: 'כרטיס + סל',  defaultW: 200, defaultH: 280 },
        { id: 'cart',    label: 'סל קניות', desc: 'סיכום הזמנה', defaultW: 340, defaultH: 300 },
        { id: 'pricing', label: 'מחירון',   desc: 'כרטיס מחיר',  defaultW: 280, defaultH: 460 },
      ]
    },
    {
      label: 'תקשורת',
      tools: [
        { id: 'contact',     label: 'יצירת קשר',    desc: 'טופס פנייה', defaultW: 400, defaultH: 460 },
        { id: 'testimonial', label: 'המלצה',         desc: 'ציטוט לקוח', defaultW: 340, defaultH: 220 },
        { id: 'social',      label: 'רשתות חברתיות', desc: 'אייקונים',   defaultW: 300, defaultH: 60  },
        { id: 'about',       label: 'אודות',         desc: 'פרטי עסק',   defaultW: 780, defaultH: 200 },
        { id: 'booking',     label: 'הזמנת תור',     desc: 'טופס קביעה', defaultW: 400, defaultH: 520 },
      ]
    },
    {
      label: 'נוספים',
      tools: [
        { id: 'map',       label: 'מפה',         desc: 'Google Maps', defaultW: 500, defaultH: 300 },
        { id: 'countdown', label: 'ספירה לאחור', desc: 'טיימר',       defaultW: 340, defaultH: 120 },
      ]
    }
  ];

  // ===== צורות גיאומטריות =====
  shapes = [
    { shapeType: 'rect',          label: 'מלבן',       icon: '▬', color: '#f97316', defaultW: 200, defaultH: 120 },
    { shapeType: 'rect-rounded',  label: 'מלבן מעוגל', icon: '▢', color: '#f97316', defaultW: 200, defaultH: 120 },
    { shapeType: 'circle',        label: 'עיגול',      icon: '⬤', color: '#f97316', defaultW: 150, defaultH: 150 },
    { shapeType: 'ellipse',       label: 'אליפסה',     icon: '⬭', color: '#f97316', defaultW: 220, defaultH: 130 },
    { shapeType: 'triangle',      label: 'משולש',      icon: '▲', color: '#f97316', defaultW: 160, defaultH: 140 },
    { shapeType: 'triangle-down', label: 'משולש הפוך', icon: '▼', color: '#f97316', defaultW: 160, defaultH: 140 },
    { shapeType: 'star',          label: 'כוכב',       icon: '★', color: '#f97316', defaultW: 150, defaultH: 150 },
    { shapeType: 'star6',         label: 'כוכב 6',     icon: '✶', color: '#f97316', defaultW: 160, defaultH: 160 },
    { shapeType: 'heart',         label: 'לב',         icon: '♥', color: '#f97316', defaultW: 160, defaultH: 150 },
    { shapeType: 'arrow-right',   label: 'חץ ימין',    icon: '→', color: '#f97316', defaultW: 180, defaultH: 90  },
    { shapeType: 'arrow-left',    label: 'חץ שמאל',    icon: '←', color: '#f97316', defaultW: 180, defaultH: 90  },
    { shapeType: 'diamond',       label: 'מעוין',      icon: '◆', color: '#f97316', defaultW: 150, defaultH: 150 },
    { shapeType: 'pentagon',      label: 'מחומש',      icon: '⬠', color: '#f97316', defaultW: 160, defaultH: 160 },
    { shapeType: 'hexagon',       label: 'משושה',      icon: '⬡', color: '#f97316', defaultW: 180, defaultH: 160 },
    { shapeType: 'cross',         label: 'צלב',        icon: '✚', color: '#f97316', defaultW: 140, defaultH: 140 },
    { shapeType: 'line-h',        label: 'קו אופקי',   icon: '─', color: '#f97316', defaultW: 300, defaultH: 4   },
    { shapeType: 'line-v',        label: 'קו אנכי',    icon: '│', color: '#f97316', defaultW: 4,   defaultH: 200 },
    { shapeType: 'badge',         label: 'באדג׳',      icon: '🏷', color: '#f97316', defaultW: 180, defaultH: 80  },
  ];

  // ===== סוגי דפים =====
  pageTypes = [
    { id: 'home',    label: 'דף בית',    desc: 'Hero, כפתורים', color: '#f97316' },
    { id: 'about',   label: 'אודות',     desc: 'סיפור, צוות',   color: '#ea580c' },
    { id: 'store',   label: 'חנות',      desc: 'מוצרים, קטלוג', color: '#c2410c' },
    { id: 'gallery', label: 'גלריה',     desc: 'תמונות',        color: '#9a3412' },
    { id: 'contact', label: 'יצירת קשר', desc: 'טופס, פרטים',  color: '#7c2d12' },
    { id: 'blank',   label: 'דף ריק',    desc: 'מאפס',          color: '#555'    },
  ];

  // ===== ניהול גרירת שכבות =====
  private dragLayerIndex = -1;
  dragOverIndex = -1;

  constructor(public state: EditorStateService) {
    // כשבוחרים אלמנט — עוברים אוטומטית ל-tab מאפיינים
    window.addEventListener('select-element', () => {// מאזינים לאירוע בחירת אלמנט שנשלח מה-canvas
      this.activeTab = 'design';//מעבר למאפיינים
    });
  }

  // סינון כלים לפי חיפוש
  get filteredGroups() {
    if (!this.searchQuery.trim()) return this.toolGroups;// אם אין חיפוש, מחזירים את כל הקבוצות
    const q = this.searchQuery.toLowerCase();// ממירים את החיפוש לאותיות קטנות להשוואה לא-רגישה לאותיות גדולות
    return this.toolGroups
      .map(g => ({// מחזירים כל קבוצה עם הכלים המסוננים לפי החיפוש
        ...g,
        tools: g.tools.filter(t =>
          t.label.toLowerCase().includes(q) ||// אם התווית של הכלי כוללת את החיפוש
          t.desc.toLowerCase().includes(q)// או אם התיאור של הכלי כולל את החיפוש
        )
      }))
      .filter(g => g.tools.length > 0);
  }

  //הוספת אלמנט
  addTool(tool: any) {
    if (!this.state.selectedPage()) return;
    this.state.addElement(tool);//שולח בקשה מהסרסיס
    this.activeTab = 'design';//מעבר למאפיינים
  }

  addShape(shape: any) {//הוספת צורה
    if (!this.state.selectedPage()) return;
    this.state.addElement({ id: 'shape', ...shape });//שולח בקשה להוסיף צורה
    this.showShapePicker = false;//מורידים את הבחירה של הצורות
    this.activeTab = 'design';//מעביר למאפיינים
  }
// התחלת גרירת כלי מהסרגל הצדדי
  onDragStart(event: DragEvent, tool: any) {
    event.dataTransfer!.effectAllowed = 'copy';// מאפשר העתקה של הכלי
    event.dataTransfer!.setData('application/json', JSON.stringify(tool));// מאחסן את פרטי הכלי בפורמט JSON בנתוני ההעברה
  }
// פתיחת בורר סוגי הדפים
  openPagePicker() {
    this.state.showPagePicker.set(true);// מציג את בורר סוגי הדפים
  }
//הוספת עמוד
  addPage(type: any) { this.state.addPage(type); }

  // ===== גרירת שכבות =====
  onLayerDragStart(index: number) { this.dragLayerIndex = index; }// מתחיל גרירת שכבה — שומר את האינדקס שלה
  onLayerDragEnter(index: number) { this.dragOverIndex  = index; }// נכנס לאזור של שכבה אחרת — מעדכן את האינדקס של האזור
  onLayerDragLeave()              { this.dragOverIndex  = -1;    }// עוזב את האזור של שכבה — מאפס את האינדקס של האזור

// משליך את השכבה למקום החדש אחרי הגרירה
  onLayerDrop(targetIndex: number) {
    this.dragOverIndex = -1;
    if (this.dragLayerIndex === targetIndex) return;// אם השכבה נזרקה על עצמה, לא עושים כלום

    this.state.saveHistory();
    const els     = [...this.state.sortedElements()].reverse();// שכבות ממוינות לפי zIndex מהגבוה לנמוך — הופכים את הסדר כדי לעבוד עם אינדקסים רגילים
    const [moved] = els.splice(this.dragLayerIndex, 1);// מוציאים את השכבה שנגררת מהמערך
    els.splice(targetIndex, 0, moved);// מכניסים את השכבה למקום החדש לפי האינדקס שאליו נזרקה

    const updated = els.map((el, i) => ({ ...el, zIndex: els.length - i }));//מסדרים את השכבות לפי הסר החדש
    this.state.elements.set(updated);//משנים בסטייט את מערך השכבות המעודכן

    const sel = this.state.selectedEl();// אם יש אלמנט נבחר, מעדכנים את הבחירה לגרסה החדשה שלו עם zIndex המעודכן
    if (sel) {
      const updatedSel = updated.find(e => e.id === sel.id);
      if (updatedSel) this.state.selectedEl.set(updatedSel);// מעדכנים את האלמנט הנבחר לגרסה החדשה שלו עם zIndex המעודכן
    }
  }
}