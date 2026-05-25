// ============================================================
// create-site.ts
// מיקום: src/app/components/create-site/create-site.ts
// ============================================================
// דף יצירת אתר חדש — שם ו-subdomain.
// אחרי יצירה מוצלחת: עובר ישר לעורך עם ID האתר החדש.
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SiteService } from '../../services/site';

@Component({
  selector: 'app-create-site',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-site.html',
  styleUrl: './create-site.css'
})
export class CreateSiteComponent {

  siteName  = '';   // שם האתר
  subdomain = '';   // כתובת האתר
  message   = '';   // הודעת שגיאה
  isLoading = false;// מצב טעינה — מושבת את הכפתור בזמן יצירה

  constructor(
    private siteService: SiteService,
    private router: Router
  ) {}

  // חזרה לדשבורד בלחיצה על ביטול
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // יצירת אתר חדש
  onCreate() {
    if (!this.siteName || !this.subdomain) {
      this.message = 'יש למלא את כל השדות';
      return;
    }

    this.isLoading = true;
// אובייקט עם נתוני האתר החדש
    const siteData = {
      siteName:  this.siteName,
      subdomain: this.subdomain
    };

    this.siteService.createSite(siteData).subscribe({
      next: (site) => {
        this.isLoading = false;
        // עוברים ישר לעורך עם ה-ID של האתר החדש
        this.router.navigate(['/editor', site.id]);
      },
      error: () => {
        this.isLoading = false;
        this.message = 'שגיאה ביצירת האתר, נסי שוב.';
      }
    });
  }
}