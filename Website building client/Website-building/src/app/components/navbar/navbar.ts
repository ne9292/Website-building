import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  constructor(public router: Router, private authService: AuthService) {}
// פונקציות עזר לניווט ולבדיקת סטטוס ההתחברות
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();// בודק אם המשתמש מחובר כדי להציג או להסתיר כפתורים מסוימים בניווט
  }
// פונקציה שמחזירה את שם המשתמש כדי להציג אותו בניווט
  getUserName(): string {
    return this.authService.getUserName();
  }
// פונקציה להתנתקות — קוראת לשירות האימות כדי לנקות את המידע על המשתמש ולנווט לדף ההתחברות
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  //פונקציה שמנווטת לדשבורד
  goToDashboard() {
    if (!this.router.url.includes('/dashboard')) {
      this.router.navigate(['/dashboard']);
    }
  }

  //פונקציה שמנווטת לדף יצירת אתר
  goToCreate() {
    if (!this.router.url.includes('/create-site')) {
      this.router.navigate(['/create-site']);
    }
  }
//פונקציה שמנווטת לדף הבית
  goToHome(){
    if (!this.router.url.includes('/home')) {
      this.router.navigate(['/home']);
    }
  }
}