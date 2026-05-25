// ייבוא TestBed — כלי הבדיקה הראשי של Angular
import { TestBed } from '@angular/core/testing';

// ייבוא קומפוננטת השורש שבודקים
import { App } from './app';

// ייבוא RouterTestingModule — נחוץ כי App משתמש ב-RouterOutlet
import { RouterTestingModule } from '@angular/router/testing';

// ייבוא HttpClientTestingModule — נחוץ כי שירותים משתמשים ב-HttpClient
import { HttpClientTestingModule } from '@angular/common/http/testing';

// קבוצת בדיקות לקומפוננטת App
describe('App', () => {

  // לפני כל בדיקה — מגדירים את סביבת הבדיקה
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,                    // הקומפוננטה שבודקים
        RouterTestingModule,    // מדמה Router — נחוץ כי יש RouterOutlet ב-app.html
        HttpClientTestingModule // מדמה HTTP — נחוץ לשירותים
      ],
    }).compileComponents(); // מקמפל את התבניות
  });

  // בדיקה 1: האם הקומפוננטה נוצרת בהצלחה?
  it('should create the app', () => {
    // יצירת הקומפוננטה
    const fixture = TestBed.createComponent(App);

    // componentInstance — הגישה למחלקת הקומפוננטה
    const app = fixture.componentInstance;

    // truthy — מאמת שהקומפוננטה קיימת (לא null/undefined)
    expect(app).toBeTruthy();
  });

  // ✅ תיקון: הבדיקה הישנה חיפשה <h1> עם "Hello, Website-building"
  // שלא קיים בפרויקט — היתה שאריה מהפרויקט הבסיסי של Angular CLI
  // החלפנו בבדיקה אמיתית — האם ה-navbar מוצג?
  it('should contain app-navbar element', async () => {
    // יצירת הקומפוננטה
    const fixture = TestBed.createComponent(App);

    // המתנה לסיום אתחול אסינכרוני
    await fixture.whenStable();

    // קבלת ה-DOM המרונדר
    const compiled = fixture.nativeElement as HTMLElement;

    // בדיקה שה-navbar קיים בדף — זהו מרכיב עיקרי ב-app.html
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });

  // בדיקה 3: האם ה-router-outlet קיים?
  it('should contain router-outlet for navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    // בדיקה שה-router-outlet קיים — הוא אחראי על הצגת הנתיבים
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});