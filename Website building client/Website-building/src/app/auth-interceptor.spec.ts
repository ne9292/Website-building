// ייבוא כלי הבדיקה של Angular
import { TestBed } from '@angular/core/testing';

// ייבוא HttpClientTestingModule — מדמה בקשות HTTP בסביבת בדיקה
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {

  let httpTesting: HttpTestingController;

  // לפני כל בדיקה — מאתחלים את סביבת הבדיקה
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // רישום ה-interceptor בסביבת הבדיקה
        provideHttpClient(withInterceptors([authInterceptor]))
      ],
      imports: [HttpClientTestingModule]
    });

    // קבלת כלי ה-HTTP הדמה
    httpTesting = TestBed.inject(HttpTestingController);
  });

  // בדיקה 1: כשיש טוקן — האם מתווסף header Authorization?
  it('should add Authorization header when token exists', () => {
    // שמירת טוקן מדומה ב-localStorage לצורך הבדיקה
    localStorage.setItem('token', 'fake-test-token');

    // ניקוי ה-localStorage אחרי הבדיקה
    localStorage.removeItem('token');
  });

  // בדיקה 2: כשאין טוקן — האם הבקשה עוברת ללא שינוי?
  it('should pass request without Authorization header when no token', () => {
    // וידוא שאין טוקן
    localStorage.removeItem('token');
  });

  // ניקוי אחרי כל בדיקה — וידוא שלא נשארו בקשות פתוחות
  afterEach(() => {
    httpTesting.verify();
  });
});