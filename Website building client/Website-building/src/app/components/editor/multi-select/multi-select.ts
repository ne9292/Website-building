// ============================================================
// multi-select.ts
// מיקום: src/app/components/editor/multi-select/multi-select.ts
// ============================================================
// קומפוננטת הבחירה המרובה — ציור מלבן בחירה וגרירה מרובה.
// ============================================================

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStateService, CanvasElement } from '../../../services/editor-state.service';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.css'
})
export class MultiSelectComponent {

  @Input()  elements:      CanvasElement[] = [];
  @Output() multiDragStart = new EventEmitter<MouseEvent>();

  // ===== מצב בחירה =====
  selectedEls:  CanvasElement[] = [];
  isSelecting = false;
  private selectStartX = 0;
  private selectStartY = 0;
  selectionBox: { x: number; y: number; w: number; h: number } | null = null;

  // ===== גרירה מרובה =====
  private multiDragStartX = 0;
  private multiDragStartY = 0;
  private multiDragEls: { el: CanvasElement; startX: number; startY: number }[] = [];

  state = inject(EditorStateService);

  // ===== ציור מלבן בחירה =====

  // נקרא מ-canvas.html כשלוחצים על הקנבס הריק
  startSelection(event: MouseEvent, canvasInner: HTMLElement, scroll: HTMLElement) {
    if ((event.target as HTMLElement).closest('.canvas-el'))    return;
    if ((event.target as HTMLElement).closest('.multi-toolbar')) return;

    const rect = canvasInner.getBoundingClientRect();
    this.selectStartX = event.clientX - rect.left;
    this.selectStartY = event.clientY - rect.top;

    this.isSelecting  = true;
    this.selectionBox = { x: this.selectStartX, y: this.selectStartY, w: 0, h: 0 };
    this.selectedEls  = [];
  }

  // נקרא מ-onMouseMove ב-CanvasComponent
  updateSelection(event: MouseEvent, canvasInner: HTMLElement, scroll: HTMLElement) {
    if (!this.isSelecting) return;

    const rect     = canvasInner.getBoundingClientRect();
    const currentX = event.clientX - rect.left + scroll.scrollLeft;
    const currentY = event.clientY - rect.top  + scroll.scrollTop;

    const x = Math.min(this.selectStartX, currentX);
    const y = Math.min(this.selectStartY, currentY);
    const w = Math.abs(currentX - this.selectStartX);
    const h = Math.abs(currentY - this.selectStartY);

    this.selectionBox = { x, y, w, h };

    // בחירת אלמנטים שחוצים את המלבן
    this.selectedEls = this.elements.filter(el =>
      el.x < x + w && el.x + el.width  > x &&
      el.y < y + h && el.y + el.height > y
    );
  }

  // נקרא מ-onMouseUp ב-CanvasComponent
  endSelection() {
    if (!this.isSelecting) return;
    this.isSelecting = false;

    const wasSmall = !this.selectionBox || this.selectionBox.w < 5 || this.selectionBox.h < 5;
    this.selectionBox = null;
    if (wasSmall) this.selectedEls = [];
  }

  clearSelection() {
    this.selectedEls  = [];
    this.selectionBox = null;
    this.isSelecting  = false;
  }

  isSelected(el: CanvasElement): boolean {
    return this.selectedEls.some(e => e.id === el.id);
  }

  // ===== גרירה מרובה =====

  startMultiDrag(event: MouseEvent) {
    if (this.selectedEls.length === 0) return;

    this.state.saveHistory();
    this.multiDragStartX = event.clientX;
    this.multiDragStartY = event.clientY;

    this.multiDragEls = this.selectedEls.map(el => ({
      el, startX: el.x, startY: el.y
    }));

    this.multiDragStart.emit(event);
  }

  updateMultiDrag(event: MouseEvent) {
    if (this.multiDragEls.length === 0) return;

    const dx = event.clientX - this.multiDragStartX;
    const dy = event.clientY - this.multiDragStartY;

    this.multiDragEls.forEach(({ el, startX, startY }) => {
      el.x = Math.max(0, startX + dx);
      el.y = Math.max(0, startY + dy);
    });
  }

  endMultiDrag()       { this.multiDragEls = []; }
  isDraggingMulti(): boolean { return this.multiDragEls.length > 0; }

  // ===== פעולות על הבחירה =====

  deleteSelected() {
    if (this.selectedEls.length === 0) return;
    this.state.saveHistory();
    this.selectedEls.forEach(el => this.state.deleteElement(el.id));
    this.clearSelection();
  }

  duplicateSelected() {
    if (this.selectedEls.length === 0) return;
    this.state.saveHistory();
    this.selectedEls.forEach(el => this.state.duplicateElement(el));
    this.clearSelection();
  }

  alignSelected(direction: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') {
    if (this.selectedEls.length < 2) return;
    this.state.saveHistory();

    const minX    = Math.min(...this.selectedEls.map(e => e.x));
    const maxX    = Math.max(...this.selectedEls.map(e => e.x + e.width));
    const minY    = Math.min(...this.selectedEls.map(e => e.y));
    const maxY    = Math.max(...this.selectedEls.map(e => e.y + e.height));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.selectedEls.forEach(el => {
      switch (direction) {
        case 'left':   el.x = minX; break;
        case 'right':  el.x = maxX - el.width; break;
        case 'center': el.x = centerX - el.width  / 2; break;
        case 'top':    el.y = minY; break;
        case 'bottom': el.y = maxY - el.height; break;
        case 'middle': el.y = centerY - el.height / 2; break;
      }
    });
  }

  distributeSelected(direction: 'horizontal' | 'vertical') {
    if (this.selectedEls.length < 3) return;
    this.state.saveHistory();

    if (direction === 'horizontal') {
      const sorted  = [...this.selectedEls].sort((a, b) => a.x - b.x);
      const totalW  = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width - sorted[0].x;
      const totalElW = sorted.reduce((s, e) => s + e.width, 0);
      const gap     = (totalW - totalElW) / (sorted.length - 1);
      let x = sorted[0].x;
      sorted.forEach(el => { el.x = x; x += el.width + gap; });
    } else {
      const sorted   = [...this.selectedEls].sort((a, b) => a.y - b.y);
      const totalH   = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height - sorted[0].y;
      const totalElH = sorted.reduce((s, e) => s + e.height, 0);
      const gap      = (totalH - totalElH) / (sorted.length - 1);
      let y = sorted[0].y;
      sorted.forEach(el => { el.y = y; y += el.height + gap; });
    }
  }

  bringForwardSelected() {
    this.state.saveHistory();
    this.selectedEls.forEach(el => this.state.bringForward(el));
  }

  sendBackwardSelected() {
    this.state.saveHistory();
    this.selectedEls.forEach(el => this.state.sendBackward(el));
  }
}