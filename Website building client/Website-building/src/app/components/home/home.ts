import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  services = [
    { title: 'Web Design', desc: 'עיצוב ממשקים חווייתיים ומותאמים אישית.' },
    { title: 'App Development', desc: 'פיתוח אפליקציות מתקדמות בטכנולוגיות החדשות ביותר.' },
    { title: 'SEO & Marketing', desc: 'קידום האתר שלך לראש תוצאות החיפוש.' }
  ];
}