// ============================================================
// dashboard.ts
// מיקום: src/app/components/dashboard/dashboard.ts
// ============================================================
// תיקון: מחיקה אופטימיסטית —
// מסיר את האתר מהמסך מיד, ואז טוען מחדש מהשרת ברקע.
// כך המשתמש רואה תגובה מיידית ללא המתנה לשרת.
// ============================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SiteService } from '../../services/site';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
// רשימת האתרים של המשתמש — נטענת מהשרת
  sites: any[] = [];
  // האם אנחנו עדיין טוענים את האתרים מהשרת? אם כן, נציג הודעת טעינה במקום את רשימת האתרים
  isLoading = true;

  constructor(
    private siteService: SiteService,
    public router: Router
  ) {}
// כשהקומפוננטה נטענת, אנחנו רוצים לטעון את האתרים של המשתמש מהשרת כדי להציג אותם בדשבורד
  ngOnInit() {
    this.loadSites();
  }
// פונקציה שמטענת את האתרים מהשרת ומעדכנת את המשתנים sites ו-isLoading בהתאם לתוצאה
  loadSites() {
    this.isLoading = true;
    this.siteService.getSites().subscribe({
      next: (data) => {
        this.sites = [...data]; // spread כדי לוודא reference חדש
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
// פונקציה שמנווטת לדף יצירת אתר
  goToCreate() {
    this.router.navigate(['/create-site']);
  }
// פונקציה שמנווטת לעורך האתר עם מזהה האתר בפרמטרים
  openEditor(site: any) {
    this.router.navigate(['/editor', site.id]);
  }
// פונקציה שמוחקת אתר — מציגה אישור לפני המחיקה, ואז מבצעת מחיקה אופטימיסטית ומטענת מחדש את האתרים מהשרת
  deleteSite(id: number) {
    if (!confirm('למחוק את האתר?')) return;

    // מחיקה אופטימיסטית — מסיר מיד מהמסך
    this.sites = this.sites.filter(s => s.id !== id);

    // שולח לשרת ברקע, ואחרי תגובה — מרענן מהשרת
    this.siteService.deleteSite(id).subscribe({
      next: () => this.loadSites(),
      error: () => {
        alert('מחיקת האתר נכשלה, נסי שוב');
        this.loadSites();
      }
    });
  }
// פונקציה שמנווטת לדף ניהול ההזמנות של אתר מסוים
  goToBookings(siteId: number) {
    this.router.navigate(['/bookings', siteId]);
  }
}