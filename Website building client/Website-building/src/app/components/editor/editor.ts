
// קומפוננטת השורש של העורך.
// אחראית על: אתחול ה-state, קיצורי מקלדת גלובליים,
// ועטיפת שלוש הקומפוננטות הילד: topbar, canvas, sidebar.
// ============================================================

import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorStateService } from '../../services/editor-state.service';
import { TopbarComponent }    from './topbar/topbar';
import { SidebarComponent }   from './sidebar/sidebar';
import { CanvasComponent }    from './canvas/canvas';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, TopbarComponent, SidebarComponent, CanvasComponent],
  // תבנית פשוטה שמציגה את ה-topbar בחלק העליון, ואת ה-canvas וה-sidebar בצדדים
  template: `
    <div class="editor-wrap" (click)="state.deselectAll()">
      <app-topbar></app-topbar>
      <div class="editor-main">
        <app-canvas></app-canvas>
        <app-sidebar></app-sidebar>
      </div>
    </div>
  `,
  styleUrl: './editor.css'
})
export class EditorComponent implements OnInit {

  constructor(
    public state:         EditorStateService, 
    private route:        ActivatedRoute,
    private router:       Router
  ) {}

  ngOnInit() {
    // קריאת מזהה האתר מה-URL ואתחול ה-state
    const siteId = Number(this.route.snapshot.paramMap.get('id'));
    this.state.init(siteId);
  }

  // ===== קיצורי מקלדת גלובליים =====
  // @HostListener — מאזין לאירוע ברמת ה-window
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const tag = (event.target as HTMLElement).tagName;

    // אם המשתמש מקליד בשדה טקסט — לא מפעילים קיצורים
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
// קיצורי מקלדת רק יעבדו אם לא מקלידים בשדה טקסט, כדי לא להפריע להקלדה רגילה
//טופס את האלמנט הבחור
    const sel = this.state.selectedEl();

    // Ctrl+Z — ביטול פעולה אחרונה
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      this.state.undo();//מחזיר אחורה בהיסטוריה
    }

    // Ctrl+S — שמירה
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      this.state.savePage();//שומר
    }

    // Ctrl+D — שכפול האלמנט הנבחר
    if (event.ctrlKey && event.key === 'd' && sel) {
      event.preventDefault();
      this.state.duplicateElement(sel);
    }

    // Delete — מחיקת האלמנט הנבחר (רק אם לא בעריכת טקסט)
    if (event.key === 'Delete' && sel && !this.state.editingTextId()) {
      this.state.deleteElement(sel.id);
    }

    // Ctrl+] — הבאה קדימה שכבה
    if (event.ctrlKey && event.key === ']' && sel) this.state.bringForward(sel);

    // Ctrl+[ — שליחה אחורה שכבה
    if (event.ctrlKey && event.key === '[' && sel) this.state.sendBackward(sel);

    // Escape — ביטול בחירה
    if (event.key === 'Escape') this.state.deselectAll();
  }

  // חזרה לדשבורד
  goBack() { this.router.navigate(['/dashboard']); }
}