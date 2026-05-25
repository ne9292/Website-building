// ============================================================
// format-bar.ts
// מיקום: src/app/components/editor/sidebar/format-bar/format-bar.ts
// ============================================================
// סרגל המאפיינים — מוצג ב-sidebar כשאלמנט נבחר.
// ✅ תיקון: הוסף SiteService לשמירת logoUrl ב-site בשרת
// ============================================================

import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStateService, CanvasElement } from '../../../../services/editor-state.service';
import { MediaService } from '../../../../services/media';
import { SiteService } from '../../../../services/site'; // ✅ ייבוא SiteService

@Component({
  selector: 'app-format-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './format-bar.html',
  styleUrl: './format-bar.css',
  encapsulation: ViewEncapsulation.None
})
export class FormatBarComponent {

  // האם תפריט קישורי הנאבר פתוח
  showNavLinks = false;

  constructor(
    public state:          EditorStateService,
    private mediaService:  MediaService,
    private siteService:   SiteService  
  ) {}

  // ===== העלאת תמונה =====
  // field — שם השדה ב-content שיקבל את ה-URL
  onImageUpload(event: any, el: CanvasElement, field: string) {
    const file = event.target.files[0];// אם לא נבחר קובץ, לא עושים כלום
    if (!file) return;
    this.mediaService.uploadImage(file).subscribe({// אחרי שהקובץ עלה בהצלחה, מקבלים את ה-URL ומעדכנים את האלמנט
      next: (res) => {
        el.content[field] = res.url;

        if (field === 'logoUrl' && el.type === 'navbar') {//אם הקובץ הוא לוגו של ה-navbar, שומרים את ה-URL בשרת
          const siteId = this.state.siteId();// מקבלים את מזהה האתר מהסטייט
          this.siteService.updateSite(siteId, { logoUrl: res.url }).subscribe({// שולחים את העדכון לשרת, ומדפיסים לוג להצלחה או שגיאה
            next: () => console.log('לוגו נשמר בשרת בהצלחה'),
            error: (err) => console.error('שגיאה בשמירת לוגו לשרת:', err)
          });
        }
      },
      error: (err) => console.error('שגיאה בהעלאת תמונה:', err)
    });
  }

  // ===== העלאת PDF =====
  onPdfUpload(event: any, el: CanvasElement) {
    const file = event.target.files[0];// אם לא נבחר קובץ, לא עושים כלום
    if (!file) return;
    this.mediaService.uploadImage(file).subscribe({// אחרי שהקובץ עלה בהצלחה, מקבלים את ה-URL ומעדכנים את האלמנט
      next: (res) => { el.content.url = res.url; el.content.fileName = file.name; },
      error: ()    => alert('שגיאה בהעלאת ה-PDF')
    });
  }

  // ===== העלאת וידאו =====
  uploadVideo(el: CanvasElement) {
    const input    = document.createElement('input');// יוצרים אלמנט קלט מסוג קובץ שמקבל רק וידאו
    input.type     = 'file';// סוג הקלט הוא קובץ
    input.accept   = 'video/*';// מקבלים רק קבצי וידאו
    input.onchange = (e: any) => {// כשנבחר קובץ, אם לא נבחר קובץ, לא עושים כלום
      const file = e.target.files[0];
      if (!file) return;
      this.mediaService.uploadVideo(file).subscribe({// אחרי שהקובץ עלה בהצלחה, מקבלים את ה-URL ומעדכנים את האלמנט
        next: (res) => { el.content.localUrl = res.url; },
        error: ()    => alert('שגיאה בהעלאת הוידאו')
      });
    };
    input.click();
  }

  // ===== העלאת תמונות לגלריה =====
  addGalleryImages(el: CanvasElement) {// יוצרים אלמנט קלט מסוג קובץ שמקבל רק תמונות ומאפשר בחירה של כמה קבצים
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = 'image/*';// מקבלים רק קבצי תמונה
    input.multiple = true;// מאפשרים לבחור כמה קבצים
    input.onchange = (e: any) => {
      Array.from(e.target.files as FileList).forEach((file: File) => {// עבור כל קובץ שנבחר, מעלים אותו ומוסיפים את ה-URL לגלריה של האלמנט
        this.mediaService.uploadImage(file).subscribe({
          next: (res) => { el.content.images.push({ url: res.url, caption: '' }); },// אחרי שהקובץ עלה בהצלחה, מוסיפים את ה-URL לגלריה של האלמנט
          error: ()    => alert('שגיאה בהעלאת תמונה לגלריה')
        });
      });
    };
    input.click();// פותחים את חלון הבחירה של הקבצים
  }

  // ===== הוספת קישור ב-Quill =====
  insertLink(el: CanvasElement) {
    const quill = (window as any)._quillInstances?.get(el.id);// מקבלים את מופע ה-Quill של האלמנט הנבחר לפי מזהה האלמנט
    if (!quill) return;
    const url = prompt('הכניסי כתובת URL:');
    if (!url) return;// אם המשתמש לא הכניס URL, לא עושים כלום
    const range = quill.getSelection();// מקבלים את הטווח הנבחר ב-Quill
    if (range && range.length > 0) {// אם יש טקסט נבחר, מוסיפים לו את הקישור
      quill.formatText(range.index, range.length, 'link', url);
    } else {
      const text = prompt('טקסט הקישור:') || url;// אם המשתמש לא הכניס טקסט לקישור, נשתמש ב-URL כטקסט
      quill.insertText(quill.getLength() - 1, text, 'link', url);// אם אין טקסט נבחר, מוסיפים את הקישור בסוף הטקסט עם הטקסט שהמשתמש הכניס או ה-URL
    }
  }

  // ===== עיצוב טקסט ב-Quill =====
  formatQuill(el: CanvasElement, format: string) {
    const quill = (window as any)._quillInstances?.get(el.id);
    if (quill) {
      const range = quill.getSelection();// מקבלים את הטווח הנבחר ב-Quill
      if (range) {
        const current = quill.getFormat(range);// מקבלים את העיצובים הנוכחיים של הטקסט הנבחר
        quill.formatText(range.index, range.length, format, !current[format]);// הופכים את העיצוב הנוכחי של הפורמט המבוקש (לדוגמה, אם הוא כבר מודגש, נסיר את הדגשה, ולהפך)
        return;
      }
    }
    if (format === 'bold')      el.content.bold      = !el.content.bold;
    if (format === 'italic')    el.content.italic    = !el.content.italic;
    if (format === 'underline') el.content.underline = !el.content.underline;
  }
}