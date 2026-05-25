// ============================================================
// canvas.ts
// מיקום: src/app/components/editor/canvas/canvas.ts
// תפקיד הקומפוננטה: אזור העריכה המרכזי — מציג את האלמנטים ומאפשר גרירה, שינוי גודל, בחירה מרובה ועוד.
// ============================================================

import { Component, HostListener, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStateService, CanvasElement, CANVAS_WIDTH } from '../../../services/editor-state.service';
import { MediaService } from '../../../services/media';
import { CanvasElementComponent } from './canvas-element/canvas-element';
import { MultiSelectComponent } from '../multi-select/multi-select';

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';// ידיות שינוי הגודל: צפון-מערב, צפון-מזרח, דרום-מערב, דרום-מזרח

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, CanvasElementComponent, MultiSelectComponent],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css'
})
export class CanvasComponent implements AfterViewInit {

  isDragOver = false;// האם יש גרירה מעל הקנבס

  private dragging:    CanvasElement | null = null;// האלמנט שנגרר כרגע
  private dragOffsetX  = 0;// הזזת העכבר בתוך האלמנט בעת תחילת הגרירה, כדי שהאלמנט לא "יקפוץ" למיקום של העכבר
  private dragOffsetY  = 0;

  private resizing:       CanvasElement | null = null;// האלמנט שנשנה גודלו כרגע
  private resizeHandle:   ResizeHandle | null  = null;// ידית שינוי הגודל שבה משתמשים כרגע
  private resizeStartX    = 0;// מיקום העכבר בעת תחילת שינוי הגודל
  private resizeStartY    = 0;
  private resizeStartW    = 0;// רוחב וגובה האלמנט בעת תחילת שינוי הגודל
  private resizeStartH    = 0;
  private resizeStartElX  = 0;// מיקום האלמנט בעת תחילת שינוי הגודל, כדי שנוכל לשנות את המיקום שלו גם כן אם משנים את הידית ה-nw או sw
  private resizeStartElY  = 0;

  private draggingImage:  CanvasElement | null = null;//אלמנט תמונה שנגרר מתוך אלמנט אחר (כמו גלריה) כדי לגרור אותו למיקום חדש בקנבס
  private imageDragStartX = 0;// מיקום העכבר בעת תחילת גרירת התמונה מתוך האלמנט, כדי שהאלמנט לא "יקפוץ" למיקום של העכבר
  private imageDragStartY = 0;
  private imagePosStartX  = 0;
  private imagePosStartY  = 0;

  contextMenu: { x: number; y: number; el: CanvasElement } | null = null;// מידע על תפריט ההקשר שמופיע בעת לחיצה ימנית על אלמנט: המיקום שלו והאלמנט עליו נלחץ

  @ViewChild(MultiSelectComponent) multiSelect!: MultiSelectComponent;// הפניה לקומפוננטת הבחירה המרובה כדי לעדכן אותה במקרים של בחירה רגילה, גרירה או שינוי גודל
  Math = Math;

  constructor(
    public state:         EditorStateService,
    private mediaService: MediaService
  ) {}

  ngAfterViewInit() { this.expandCanvasOnScroll(); }// מרחיבים את הקנבס כשגוללים למטה כדי לאפשר גרירה למטה בלי הגבלת גובה

  get canvasInnerEl(): HTMLElement {// הפניה לאלמנט הפנימי של הקנבס שבו נמצאים האלמנטים, כדי לחשב מיקומים יחסיים ולשנות את הגובה שלו דינמית
    return document.querySelector('.canvas-inner') as HTMLElement;
  }
  // הפניה לאלמנט הגלילה של הקנבס כדי לחשב מיקומים יחסיים ולשנות את הגובה של האלמנט הפנימי דינמית
  get scrollEl(): HTMLElement {
    return document.querySelector('.canvas-scroll') as HTMLElement;
  }

  // פונקציה שמחזירה את רוחב הקנבס הנוכחי, שהוא רוחב האלמנט הפנימי או רוחב ברירת המחדל אם האלמנט עדיין לא נטען
  getCanvasWidth(): number {
    return this.canvasInnerEl?.offsetWidth ?? CANVAS_WIDTH;
  }
// מאזינים לאירועי העכבר על הקנבס כדי לנהל גרירה, שינוי גודל ובחירה מרובה
  private expandCanvasOnScroll() {
    const scroll = document.querySelector('.canvas-scroll') as HTMLElement;// מאזינים לאירוע גלילה על אלמנט הגלילה של הקנבס
    const inner  = document.querySelector('.canvas-inner')  as HTMLElement;//מאזינים לאירוע גלילה של אלמנט הגלילה של הקנבס
    if (!scroll || !inner) return;// אם האלמנטים לא נמצאו, לא עושים כלום
    scroll.addEventListener('scroll', () => {// כשגוללים, בודקים אם הגלילה הגיעה ל-90% מהגובה הנוכחי של האלמנט הפנימי, ואם כן, מוסיפים עוד 1000 פיקסלים לגובה שלו כדי לאפשר גלילה נוספת
      const scrollBottom  = scroll.scrollTop + scroll.clientHeight;// מיקום תחתית הגלילה הנוכחי
      const currentHeight = inner.offsetHeight;// הגובה הנוכחי של האלמנט הפנימי
      if (scrollBottom > currentHeight * 0.9) {
        inner.style.minHeight = (currentHeight + 1000) + 'px';
      }
    });
  }
// מאזינים לאירועי גרירה על הקנבס כדי לאפשר גרירת כלים מהסרגל הצדדי אל הקנבס
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';// מציגים סימן של "העתקה" כדי להבהיר למשתמש שהכלי יועתק לקנבס ולא יזוז מהסרגל
    this.isDragOver = true;// מעדכנים את המצב כדי להוסיף סגנון חזותי שמראה שהמשתמש יכול לשחרר את הכלי כדי להוסיף אותו לקנבס
  }
  onDragLeave() { this.isDragOver = false; }// כשעוזבים את אזור הקנבס עם הכלי, מעדכנים את המצב כדי להסיר את הסגנון החזותי של גרירה מעל הקנבס

  // מאזינים לאירוע שחרור הגרירה על הקנבס כדי להוסיף את הכלי שנגרר לקנבס במיקום שבו שוחרר
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const raw = event.dataTransfer!.getData('application/json');// מקבלים את הנתונים שנגררו, שהם מחרוזת JSON שמייצגת את הכלי שנבחר בסרגל הצדדי, ומפרשים אותה לאובייקט
    if (!raw) return;
    const tool     = JSON.parse(raw);
    const canvasEl = event.currentTarget as HTMLElement;// האלמנט של הקנבס שבו נזרק הכלי, כדי לחשב את המיקום שבו להוסיף את האלמנט החדש
    const rect     = canvasEl.getBoundingClientRect();
    const x = event.clientX - rect.left  + canvasEl.scrollLeft - tool.defaultW / 2;
    const y = event.clientY - rect.top   + canvasEl.scrollTop  - 30;
    this.state.addElement(tool, Math.max(0, x), Math.max(0, y));// מוסיפים את האלמנט החדש לקנבס במיקום המחושב, ומוודאים שהמיקום לא יהיה שלילי כדי שלא יתווסף מחוץ לקנבס
  }
// פונקציות שמטפלות בגרירה ושינוי גודל של האלמנטים על הקנבס, ומעדכנות את המיקום והגודל שלהם בהתאם לתנועת העכבר
  startDrag(event: MouseEvent, el: CanvasElement) {
    if (this.state.editingTextId() === el.id) return;// אם אנחנו כרגע עורכים טקסט בתוך האלמנט הזה, לא מתחילים גרירה כדי לא להפריע לעריכת הטקסט
    if (event.detail === 2) return;// אם זה קליק כפול, לא מתחילים גרירה כדי לא להפריע לפעולה של הקליק הכפול (כמו כניסה למצב עריכת טקסט)
    event.preventDefault();
    event.stopPropagation();
    this.state.saveHistory();
    this.dragging = el;// מסמנים שהאלמנט הזה הוא זה שנגרר כרגע
    this.state.selectElement(el);// בוחרים את האלמנט שנגרר כדי להציג את המסגרת והידיות שלו
    const canvas = (event.currentTarget as HTMLElement).closest('.canvas-scroll') as HTMLElement;// האלמנט של הגלילה של הקנבס, כדי לחשב את המיקום היחסי של העכבר בתוך הקנבס
    const rect   = canvas?.getBoundingClientRect() ?? { left: 0, top: 0 };// מלבד המיקום של העכבר, גם לוקחים בחשבון את מיקום הגלילה של הקנבס כדי שהאלמנט יעקוב בצורה מדויקת אחרי העכבר גם כשגוללים
    this.dragOffsetX = event.clientX - rect.left + (canvas?.scrollLeft ?? 0) - el.x;// מחשבים את ההזזה של העכבר בתוך האלמנט כדי שהאלמנט לא "יקפוץ" למיקום של העכבר אלא יעקוב אחרי העכבר בצורה חלקה
    this.dragOffsetY = event.clientY - rect.top  + (canvas?.scrollTop  ?? 0) - el.y;
  }
//פונקציה שמשנה את הגודל
  startResize(event: MouseEvent, el: CanvasElement, handle: ResizeHandle) {
    event.preventDefault();
    event.stopPropagation();
    this.state.saveHistory();
    this.resizing       = el;// מסמנים שהאלמנט הזה הוא זה שנשנה גודלו כרגע
    this.resizeHandle   = handle;// מסמנים באיזו ידית שינוי גודל משתמשים כרגע כדי לדעת איך לשנות את הגודל והמיקום של האלמנט בהתאם לתנועת העכבר
    this.resizeStartX   = event.clientX;// מיקום העכבר בעת תחילת שינוי הגודל כדי לחשב את השינוי בגודל ובמיקום של האלמנט בהתאם לתנועת העכבר
    this.resizeStartY   = event.clientY;
    this.resizeStartW   = el.width;// רוחב וגובה האלמנט בעת תחילת שינוי הגודל כדי לחשב את הגודל החדש של האלמנט בהתאם לתנועת העכבר
    this.resizeStartH   = el.height;
    this.resizeStartElX = el.x;
    this.resizeStartElY = el.y;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    // מאזינים לתנועת העכבר על כל חלון הדפדפן כדי לנהל את הגרירה ושינוי הגודל של האלמנטים בצורה חלקה גם אם העכבר יוצא מהקנבס במהלך הפעולה
    const canvas = document.querySelector('.canvas-scroll') as HTMLElement;
    // הפניה לאלמנט הפנימי של הקנבס שבו נמצאים האלמנטים, כדי לחשב מיקומים יחסיים ולשנות את הגובה שלו דינמית
    const inner  = document.querySelector('.canvas-inner')  as HTMLElement;
// גרירת תמונה מתוך אלמנט (כמו גלריה) כדי לשנות את מיקום התמונה בתוך האלמנט בלי לשנות את המיקום של האלמנט עצמו בקנבס
    if ((window as any)._isDraggingImage) {
      const el = (window as any)._imageDragEl as CanvasElement;
      if (el && !this.draggingImage) {
        this.draggingImage   = el;
        this.imageDragStartX = (window as any)._imageDragStartX;
        this.imageDragStartY = (window as any)._imageDragStartY;
        this.imagePosStartX  = (window as any)._imagePosStartX;
        this.imagePosStartY  = (window as any)._imagePosStartY;
        (window as any)._isDraggingImage = false;
      }
    }

    if (this.multiSelect?.isSelecting) {
      this.multiSelect.updateSelection(event, inner, canvas);
      return;
    }
    if (this.multiSelect?.isDraggingMulti()) {
      this.multiSelect.updateMultiDrag(event);
      return;
    }

    // גרירת אלמנט
    if (this.dragging && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x    = event.clientX - rect.left + canvas.scrollLeft - this.dragOffsetX;
      const y    = event.clientY - rect.top  + canvas.scrollTop  - this.dragOffsetY;
      const maxX = this.getCanvasWidth() - this.dragging.width;
      this.dragging.x = Math.min(Math.max(0, x), Math.max(0, maxX));
      this.dragging.y = Math.max(0, y);
    }

    // גרירת תמונה פנימית
    if (this.draggingImage) {
      const dx   = event.clientX - this.imageDragStartX;
      const dy   = event.clientY - this.imageDragStartY;
      const newX = Math.min(100, Math.max(0, this.imagePosStartX - dx * 0.3));
      const newY = Math.min(100, Math.max(0, this.imagePosStartY - dy * 0.3));
      this.draggingImage.content.objectPositionX = newX;
      this.draggingImage.content.objectPositionY = newY;
      this.draggingImage.content.objectPosition  = `${newX}% ${newY}%`;
      this.draggingImage.content.bgPosition      = `${newX}% ${newY}%`;
    }

    // Resize — 4 פינות
    if (this.resizing && this.resizeHandle) {
      const dx = event.clientX - this.resizeStartX;
      const dy = event.clientY - this.resizeStartY;
      const canvasWidth = this.getCanvasWidth();
      const el = this.resizing;

      switch (this.resizeHandle) {
        case 'se':
          el.width  = Math.max(40, Math.min(this.resizeStartW + dx, canvasWidth - el.x));
          el.height = Math.max(20, this.resizeStartH + dy);
          break;
        case 'sw':
          el.width  = Math.max(40, this.resizeStartW - dx);
          el.x      = Math.max(0, this.resizeStartElX + dx);
          el.height = Math.max(20, this.resizeStartH + dy);
          break;
        case 'ne':
          el.width  = Math.max(40, Math.min(this.resizeStartW + dx, canvasWidth - el.x));
          el.height = Math.max(20, this.resizeStartH - dy);
          el.y      = Math.max(0, this.resizeStartElY + dy);
          break;
        case 'nw':
          el.width  = Math.max(40, this.resizeStartW - dx);
          el.x      = Math.max(0, this.resizeStartElX + dx);
          el.height = Math.max(20, this.resizeStartH - dy);
          el.y      = Math.max(0, this.resizeStartElY + dy);
          break;
      }
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.multiSelect?.endSelection();
    if (this.multiSelect?.isDraggingMulti()) this.multiSelect.endMultiDrag();
    this.dragging     = null;
    this.resizing     = null;
    this.resizeHandle = null;
    if (this.draggingImage) {
      // ✅ שמור אחרי גרירת תמונה
      this.state.savePage();
    }
    this.draggingImage = null;
  }

  onCanvasClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.canvas-el'))    return;
    if (target.closest('.multi-toolbar')) return;
    if ((this.multiSelect?.selectedEls?.length ?? 0) > 1) return;
    this.state.deselectAll();
    this.multiSelect?.clearSelection();
    this.closeContextMenu();
  }
// פונקציות שמטפלות בבחירת אלמנטים, פתיחת תפריט הקשר ופתיחת בורר עמודים
  selectEl(el: CanvasElement, event: MouseEvent) {
    event.stopPropagation();
    this.closeContextMenu();
    if ((this.multiSelect?.selectedEls?.length ?? 0) > 1) return;
    this.multiSelect?.clearSelection();
    this.state.selectElement(el);
    window.dispatchEvent(new CustomEvent('select-element'));
  }
// פונקציה שמטפלת בכניסה למצב עריכת טקסט בתוך אלמנט, ומוודאת שהאלמנט הוא מסוג שניתן לערוך את הטקסט שלו
  startEditText(el: CanvasElement, event: MouseEvent) {
    event.stopPropagation();
    const editableTypes = ['text', 'button', 'hero', 'product', 'navbar', 'testimonial', 'about'];
    if (!editableTypes.includes(el.type)) return;
    this.state.editingTextId.set(el.id);
  }
// פונקציה שמטפלת ביציאה ממצב עריכת טקסט, פשוט מאפס את ה-editingTextId כדי לצאת ממצב העריכה
  stopEditText() { this.state.editingTextId.set(null); }
// פונקציה שמטפלת בלחיצה ימנית על אלמנט כדי לפתוח את תפריט ההקשר, ומוודאת שהאלמנט שנלחץ הוא לא אלמנט בתוך תפריט הקשר או סרגל בחירה מרובה כדי לא להפריע לפעולות שלהם
  openContextMenu(event: MouseEvent, el: CanvasElement) {
    event.preventDefault();
    event.stopPropagation();
    this.state.selectElement(el);
    this.contextMenu = { x: event.clientX, y: event.clientY, el };
  }
//פונקציה שסוגרת את האלמנט לחיצה ימניםתפריט הקשר
  closeContextMenu() { this.contextMenu = null; }
  // פונקציה שמציגה את בורר העמודים כדי לבחור עמוד אחר לעריכה
  openPagePicker()   { this.state.showPagePicker.set(true); }
// פונקציה שמחזירה את סגנון הצללה של אלמנט, או 'none' אם אין לו צל
  shadowStyle(el: CanvasElement): string {
    if (!el.shadow) return 'none';
    return `${el.shadowX}px ${el.shadowY}px ${el.shadowBlur}px ${el.shadowColor}`;
  }
// פונקציה שמחזירה את סגנון הגבול של אלמנט, או 'none' אם אין לו גבול
  borderStyle(el: CanvasElement): string {
    if (!el.border?.width) return 'none';
    return `${el.border.width}px ${el.border.style || 'solid'} ${el.border.color}`;
  }
}