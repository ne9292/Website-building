// ============================================================
// ai-generator.ts
// ============================================================

import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EditorStateService } from '../../../../services/editor-state.service';
import { environment } from '../../../../../environments/environment';

const AI_URL = `${environment.apiUrl}/api/ai/generate-site`;

@Component({
  selector: 'app-ai-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-generator.html',
  styleUrl: './ai-generator.css'
})
export class AiGeneratorComponent {

  @Output() close = new EventEmitter<void>();

  prompt    = '';
  loading   = signal(false);
  error     = signal('');
  step      = signal<'input' | 'generating' | 'done'>('input');
  progress  = signal(0);
  statusMsg = signal('');

  constructor(
    private http:  HttpClient,
    public  state: EditorStateService
  ) {}

  async generate() {
    if (!this.prompt.trim()) return;

    this.loading.set(true);
    this.error.set('');
    this.step.set('generating');
    this.progress.set(10);
    this.statusMsg.set('מנתח את העסק שלך...');

    try {
      this.progress.set(30);
      this.statusMsg.set('יוצר את מבנה האתר...');

      this.progress.set(50);
      this.statusMsg.set('מעצב את האלמנטים...');

      const response: any = await this.http.post(AI_URL, { prompt: this.prompt }).toPromise();
      const text = response.candidates[0].content.parts[0].text;

      this.progress.set(70);
      this.statusMsg.set('מארגן את הדפים...');

      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(clean);

      this.progress.set(85);
      this.statusMsg.set('מוסיף לעורך...');

      await this.applyToEditor(data);

      this.progress.set(100);
      this.statusMsg.set('האתר מוכן!');
      this.step.set('done');

    } catch (e: any) {
      this.error.set('שגיאה ביצירת האתר. נסי שוב.');
      this.step.set('input');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  private async applyToEditor(data: any) {
    if (!data.pages?.length) return;

    let idCounter = Date.now();

    // ✅ עבור על כל הדפים שה-AI יצר
    for (let pageIndex = 0; pageIndex < data.pages.length; pageIndex++) {
      const pageData = data.pages[pageIndex];
      if (!pageData) continue;

      // ✅ אם אין דף קיים — צור אחד
      let targetPage = this.state.pages()[pageIndex];
      if (!targetPage) {
        await new Promise<void>((resolve) => {
          this.state.addPage({
            id: pageData.slug || pageData.name || 'page-' + pageIndex,
            label: pageData.title || pageData.name || 'דף ' + (pageIndex + 1),
            isHome: pageIndex === 0
          });
          setTimeout(resolve, 800);
        });
        targetPage = this.state.pages()[pageIndex];
      }

      if (!targetPage) continue;

      // בחר את הדף
      this.state.selectPage(targetPage);
      await new Promise(r => setTimeout(r, 300));

      const elements = (pageData.elements || []).map((el: any, i: number) => {
        // ✅ תיקון: el.content יכול להיות string — נטפל בזה
        let content: any = {};
        if (el.content && typeof el.content === 'object') {
          content = { ...el.content };
        }

        // מיזוג שדות ישירות מהאלמנט לתוך content
        if (el.bgColor   && !content.bgColor)   content.bgColor   = el.bgColor;
        if (el.textColor && !content.textColor) content.textColor = el.textColor;
        if (el.btnColor  && !content.btnColor)  content.btnColor  = el.btnColor;
        if (el.accentColor && !content.accentColor) content.accentColor = el.accentColor;
        if (el.title     && !content.title)     content.title     = el.title;
        if (el.subtitle  && !content.subtitle)  content.subtitle  = el.subtitle;
        if (el.text      && !content.text) {
          content.title = el.text;
          content.text  = el.text;
        }
        if (el.links && !content.links) content.links = el.links.map((l: any) => ({
          label: l.text || l.label || '',
          page: '',
          url: l.url || '',
          type: 'url'
        }));
        if (el.siteName && !content.siteName) content.siteName = el.siteName;

        // ברירות מחדל לפי סוג
        if (el.type === 'navbar') {
          if (!content.siteName) content.siteName = 'שם האתר';
          if (!content.links) content.links = [];
        }
        if (el.type === 'hero') {
          if (!content.showBtn) content.showBtn = false;
          if (!content.overlayOpacity) content.overlayOpacity = 0;
        }

        return {
          id: idCounter++,
          type: el.type === 'section' ? 'text' : (el.type || 'text'),
          label: el.type || 'text',
          x: el.x || 0,
          y: el.y || 0,
          width: el.width || 1100,
          height: el.height || 100,
          zIndex: i + 1,
          opacity: 1,
          shadow: false,
          shadowColor: 'rgba(0,0,0,0.25)',
          shadowBlur: 12,
          shadowX: 4,
          shadowY: 4,
          border: { width: 0, color: '#f97316', style: 'solid', radius: 0 },
          content,
          shapeType: el.shapeType
        };
      });

      this.state.elements.set(elements);
      this.state.savePage();
      await new Promise(r => setTimeout(r, 300));
    }

    // חזור לדף הראשון
    const firstPage = this.state.pages()[0];
    if (firstPage) this.state.selectPage(firstPage);
  }

  onClose() { this.close.emit(); }
}