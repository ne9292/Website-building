// ============================================================
// canvas-element.ts
// מיקום: src/app/components/editor/canvas/canvas-element/canvas-element.ts
// ============================================================
// מציגה אלמנט בודד על הקנבס לפי סוגו.
// ============================================================

import { Component, Input, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStateService, CanvasElement } from '../../../../services/editor-state.service';
import { MediaService } from '../../../../services/media';
import { DomSanitizer } from '@angular/platform-browser';
import Quill from 'quill';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-canvas-element',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './canvas-element.html',
  styleUrl: './canvas-element.css'
})
export class CanvasElementComponent implements AfterViewChecked {

  // האלמנט שהקומפוננטה מציגה — מגיע מ-CanvasComponent
  @Input() el!: CanvasElement;

  // חשיפת Math לתמפלט עבור חישובים ב-SVG
  Math = Math;

  // הודעות "נוסף לסל!" לכל מוצר — key=el.id, value=האם מוצגת
  cartFeedback = new Map<number, boolean>();

  // שמירת Quill instances — כדי לדעת אם כבר יצרנו
  private quillInstances = new Map<number, any>();

  // ID האלמנט שהיה בעריכה בסבב הקודם
  private lastEditingId: number | null = null;

  // עמודי PDF שרונדרו
  pdfPages: string[] = [];


  readonly LOGO_PATH = 'logo.png';

  constructor(
    public state:          EditorStateService,
    private mediaService:  MediaService,
    private sanitizer:     DomSanitizer
  ) {}

  // ===== Lifecycle =====
  // רץ אחרי כל סבב רנדור — בודק אם נפתחה עריכת טקסט חדשה
  ngAfterViewChecked() {
    const currentId = this.state.editingTextId();

    if (currentId === this.el.id && currentId !== this.lastEditingId) {
      if (this.el.type === 'text') {
        this.initQuill(this.el);
      }
    }

    this.lastEditingId = currentId;
  }

  // ===== העלאת תמונה מהקנבס =====
  // field — שם השדה ב-content: 'url' | 'imageUrl' | 'logoUrl' וכו'
  triggerImageUpload(el: CanvasElement, field: string = 'url') {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      this.mediaService.uploadImage(file).subscribe({
        next: (res) => { el.content[field] = res.url; },
        error: (err) => {
          console.error('שגיאה בהעלאת תמונה:', err);
          alert('שגיאה בהעלאת התמונה — בדקי את הקונסול לפרטים');
        }
      });
    };
    input.click();
  }

  // ===== העלאת PDF מהקנבס =====
  triggerPdfUpload(el: CanvasElement) {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = 'application/pdf';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      this.mediaService.uploadImage(file).subscribe({
        next: (res) => {
          el.content.url      = res.url;
          el.content.fileName = file.name;
          this.renderPdf(res.url);
        },
        error: (err) => {
          console.error('שגיאה בהעלאת PDF:', err);
          alert('שגיאה בהעלאת ה-PDF');
        }
      });
    };
    input.click();
  }

  // ===== העלאת תמונות לגלריה מהקנבס =====
  addGalleryImages(el: CanvasElement) {
    // ✅ תיקון: אתחול מערך images אם לא קיים — מונע שגיאת "cannot read property push of undefined"
    if (!el.content.images) {
      el.content.images = [];
    }

    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = 'image/*';
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files as FileList);
      if (!files.length) return;

      files.forEach((file: File) => {
        this.mediaService.uploadImage(file).subscribe({
          next: (res) => {
            // ✅ תיקון: בדיקה שוב שהמערך קיים לפני push
            if (!el.content.images) el.content.images = [];
            el.content.images.push({ url: res.url, caption: '' });
          },
          error: (err) => {
            // ✅ תיקון: console.error מציג את השגיאה המדויקת
            console.error('שגיאה בהעלאת תמונה לגלריה:', err);
            alert('שגיאה בהעלאת תמונה לגלריה — בדקי את הקונסול לפרטים');
          }
        });
      });
    };
    input.click();
  }

  // ===== העלאת וידאו מהקנבס =====
  // ✅ תיקון: פונקציה חדשה לוידאו עם console.error לדיבוג
  // (הפונקציה הייתה רק ב-format-bar.ts, כאן מוסיפים גם לקנבס)
  triggerVideoUpload(el: CanvasElement) {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = 'video/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      this.mediaService.uploadVideo(file).subscribe({
        next: (res) => {
          el.content.localUrl = res.url;
        },
        error: (err) => {
          console.error('שגיאה בהעלאת וידאו:', err);
          alert('שגיאה בהעלאת הוידאו — בדקי את הקונסול לפרטים');
        }
      });
    };
    input.click();
  }

  // ===== רנדור PDF =====
  async renderPdf(url: string) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

    const response    = await fetch(url, { headers: { 'Origin': 'http://localhost:4200' } });
    const arrayBuffer = await response.arrayBuffer();
    const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    this.pdfPages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page     = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas   = document.createElement('canvas');
      canvas.width   = viewport.width;
      canvas.height  = viewport.height;
      await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport }).promise;
      this.pdfPages.push(canvas.toDataURL());
    }
  }

  getSafePdfUrl(url: string): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ===== סל קניות =====
  // מוסיף מוצר לסל ומציג הודעת "נוסף לסל!" למשך 2 שניות
  addToCartWithFeedback(el: CanvasElement, event: MouseEvent) {
    event.stopPropagation();
    this.state.addToCart(el.content);
    this.cartFeedback.set(el.id, true);
    setTimeout(() => this.cartFeedback.set(el.id, false), 2000);
  }

  // ===== Quill — עורך טקסט עשיר =====
  // נקרא מ-ngAfterViewChecked כשנפתחת עריכה
  initQuill(el: CanvasElement) {
    setTimeout(() => {
      const container = document.getElementById(`quill-${el.id}`);
      if (!container) return;

      // מחיקת instance ישן
      if (this.quillInstances.has(el.id)) {
        this.quillInstances.delete(el.id);
      }
      container.innerHTML = '';

      // יצירת Quill ללא toolbar — הכפתורים נמצאים ב-format-bar
      const quill = new Quill(container, {
        theme: 'snow',
        modules: { toolbar: false }
      });

      // טעינת תוכן קיים
      if (el.content.richText) {
        quill.setContents(JSON.parse(el.content.richText));
      } else if (el.content.text) {
        quill.setText(el.content.text);
      }

      // שמירת שינויים בשלושה פורמטים
      quill.on('text-change', () => {
        el.content.richText = JSON.stringify(quill.getContents());
        el.content.text     = quill.getText();
        el.content.htmlText = quill.root.innerHTML;
      });

      this.quillInstances.set(el.id, quill);

      // חשיפה גלובלית — format-bar.ts משתמש בזה
      if (!(window as any)._quillInstances) {
        (window as any)._quillInstances = new Map();
      }
      (window as any)._quillInstances.set(el.id, quill);

    }, 300);
  }

  // ===== גרירת תמונה פנימה =====
  // מעביר מידע ל-window כדי ש-CanvasComponent יטפל ב-mousemove
  startImageDrag(event: MouseEvent, el: CanvasElement) {
    event.preventDefault();
    event.stopPropagation();

    (window as any)._imageDragEl     = el;
    (window as any)._imageDragStartX = event.clientX;
    (window as any)._imageDragStartY = event.clientY;
    (window as any)._imagePosStartX  = el.content.objectPositionX ?? 50;
    (window as any)._imagePosStartY  = el.content.objectPositionY ?? 50;
    (window as any)._isDraggingImage = true;
  }

  // ===== SVG Paths — צורות גיאומטריות =====
  getShapePath(el: CanvasElement): string {
    const w = el.width, h = el.height;

    switch (el.shapeType) {
      case 'triangle':
        return `M${w/2},0 L${w},${h} L0,${h} Z`;
      case 'triangle-down':
        return `M0,0 L${w},0 L${w/2},${h} Z`;
      case 'diamond':
        return `M${w/2},0 L${w},${h/2} L${w/2},${h} L0,${h/2} Z`;
      case 'pentagon': {
        const pts = Array.from({length: 5}, (_, i) => {
          const a = (i * 72 - 90) * Math.PI / 180;
          return `${w/2 + w/2 * Math.cos(a)},${h/2 + h/2 * Math.sin(a)}`;
        });
        return `M${pts.join('L')}Z`;
      }
      case 'hexagon': {
        const pts = Array.from({length: 6}, (_, i) => {
          const a = (i * 60) * Math.PI / 180;
          return `${w/2 + w/2 * Math.cos(a)},${h/2 + h/2 * Math.sin(a)}`;
        });
        return `M${pts.join('L')}Z`;
      }
      case 'star': {
        let d = '';
        const cx = w/2, cy = h/2;
        const r1 = Math.min(w,h)/2, r2 = r1 * 0.4;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? r1 : r2;
          const a = (i * 36 - 90) * Math.PI / 180;
          d += (i === 0 ? 'M' : 'L') + (cx + r * Math.cos(a)) + ',' + (cy + r * Math.sin(a));
        }
        return d + 'Z';
      }
      case 'star6': {
        let d = '';
        const cx = w/2, cy = h/2;
        const r1 = Math.min(w,h)/2, r2 = r1 * 0.5;
        for (let i = 0; i < 12; i++) {
          const r = i % 2 === 0 ? r1 : r2;
          const a = (i * 30 - 90) * Math.PI / 180;
          d += (i === 0 ? 'M' : 'L') + (cx + r * Math.cos(a)) + ',' + (cy + r * Math.sin(a));
        }
        return d + 'Z';
      }
      case 'heart': {
        const cx = w/2, top = h * 0.25;
        return `M${cx},${h*0.85}
          C${cx-w*0.05},${h*0.7} ${cx-w*0.5},${h*0.55} ${cx-w*0.5},${top}
          C${cx-w*0.5},${h*0.05} ${cx},${h*0.05} ${cx},${top}
          C${cx},${h*0.05} ${cx+w*0.5},${h*0.05} ${cx+w*0.5},${top}
          C${cx+w*0.5},${h*0.55} ${cx+w*0.05},${h*0.7} ${cx},${h*0.85}Z`;
      }
      case 'arrow-right':
        return `M0,${h*0.3} L${w*0.6},${h*0.3} L${w*0.6},0 L${w},${h/2} L${w*0.6},${h} L${w*0.6},${h*0.7} L0,${h*0.7} Z`;
      case 'arrow-left':
        return `M${w},${h*0.3} L${w*0.4},${h*0.3} L${w*0.4},0 L0,${h/2} L${w*0.4},${h} L${w*0.4},${h*0.7} L${w},${h*0.7} Z`;
      case 'cross': {
        const t=h*0.3, b=h*0.7, l=w*0.3, r=w*0.7;
        return `M${l},0 L${r},0 L${r},${t} L${w},${t} L${w},${b} L${r},${b} L${r},${h} L${l},${h} L${l},${b} L0,${b} L0,${t} L${l},${t} Z`;
      }
      case 'badge': {
        const r2 = h * 0.5;
        return `M${r2},0 L${w-r2},0 Q${w},0 ${w},${r2} L${w},${h-r2} Q${w},${h} ${w-r2},${h} L${r2},${h} Q0,${h} 0,${h-r2} L0,${r2} Q0,0 ${r2},0 Z`;
      }
      default: return '';
    }
  }
}