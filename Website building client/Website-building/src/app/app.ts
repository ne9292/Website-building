// ============================================================
// app.ts
// מיקום: src/app/app.ts
// ============================================================

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, Router } from "@angular/router";
import { NavbarComponent } from "./components/navbar/navbar";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.css"
})
export class App {
  // ה-NavbarComponent יוחבא בדפי site-viewer ו-editor, כי הם לא צריכים אותו.
  constructor(private router: Router) {}
  // בודק אם הכתובת הנוכחית היא של site-viewer או editor
  isSiteViewer(): boolean {
    return this.router.url.startsWith("/site/") 
        || this.router.url.startsWith("/editor/");
  }
}