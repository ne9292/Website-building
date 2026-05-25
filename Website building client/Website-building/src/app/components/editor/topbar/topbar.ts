import { Component } from '@angular/core';
import { AiGeneratorComponent } from './ai-generator/ai-generator';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, AiGeneratorComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
// קומפוננטה של ה-topbar בעורך האתר — מכילה את הכפתורים לשמירה, חזרה, ויצירת תוכן עם AI
// מציגה את כפתור ה-AI רק אם יש דף נבחר, כי הוא יוצר תוכן לדף הנבחר
// מציגה את כפתור השיתוף רק אם האתר פורסם, כי אין מה לשתף אם הוא לא פורסם
export class TopbarComponent {
  showAi     = false;
  showLink   = false;
  linkCopied = false;

  constructor(
    public state:   EditorStateService,
    private router: Router
  ) {}
// פונקציה שמנווטת חזרה לדשבורד — לפני זה שומרת את הדף הנוכחי כדי לא לאבד שינויים
  goBack() {
    this.state.savePage();
    this.router.navigate(['/dashboard']);
  }
// פונקציה שמופעלת כשמשנים את כותרת הדף — מעדכנת את הכותרת בדף הנבחר ושומרת
  onTitleBlur(event: any) {
    //trin: מסיר רווחים מיותרים מהכותרת
    const newTitle = event.target.value.trim();
    if (!newTitle) return;
    const page = this.state.selectedPage();
    if (page) { page.title = newTitle; this.state.savePage(); }// אם יש דף נבחר, מעדכנים את הכותרת שלו ושומרים את הדף
    else { const site = this.state.site(); // אם אין דף נבחר, מעדכנים את שם האתר (שמשמש כברירת מחדל ככותרת הדף) ושומרים את האתר
      if (site) site.siteName = newTitle; }
  }
// פונקציה שמופעלת כשמשנים את כותרת האתר — מעדכנת את שם האתר ושומרת
  get siteUrl(): string {
    const subdomain = this.state.site()?.subdomain;
    return subdomain ? `${window.location.origin}/site/${subdomain}` : '';
  }
// פונקציה שמפרסמת את האתר — משנה את הסטטוס ל-published ומציגה את כפתור השיתוף
  publish() {
    this.state.setPublished(true);
    this.showLink = true;
  }
// פונקציה שמבטלת את פרסום האתר — משנה את הסטטוס ל-unpublished ומסתירה את כפתור השיתוף
  unpublish() {
    this.state.setPublished(false);
    this.showLink = false;
  }
// פונקציה שמעתיקה את כתובת האתר ללוח — משתמשת ב-Clipboard API של הדפדפן ומציגה הודעה שהקישור הועתק
  copyLink() {
    navigator.clipboard.writeText(this.siteUrl).then(() => {// אם ההעתקה הצליחה, מציגים הודעה שהקישור הועתק
      this.linkCopied = true;// מציג הודעה שהקישור הועתק
      setTimeout(() => this.linkCopied = false, 2000);// מחזיר את המצב לקדמותו אחרי 2 שניות
    });
  }
}
