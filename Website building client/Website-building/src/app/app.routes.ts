// ============================================================
// app.routes.ts
// ============================================================

import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { LoginComponent }       from './components/auth/login/login';
import { RegisterComponent }    from './components/auth/register/register';
import { DashboardComponent }   from './components/dashboard/dashboard';
import { CreateSiteComponent }  from './components/create-site/create-site';
import { EditorComponent }      from './components/editor/editor';
import { BookingsComponent }    from './components/bookings/booking';
import { HomeComponent }        from './components/home/home';
import { SiteViewerComponent }  from './components/site-viewer/site-viewer';

import { authGuard }     from './auth.guard';
import { loggedInGuard } from './logged-in.guard';
import { AuthService }   from './services/auth';

const rootGuard = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree([auth.isLoggedIn() ? '/dashboard' : '/home']);
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [rootGuard], component: HomeComponent },

  { path: 'home',     component: HomeComponent },
  { path: 'login',    component: LoginComponent,    canActivate: [loggedInGuard] },// אם כבר מחובר, לא צריך לראות את דף ההתחברות או ההרשמה
  { path: 'register', component: RegisterComponent, canActivate: [loggedInGuard] },

  { path: 'dashboard',        component: DashboardComponent,  canActivate: [authGuard] },// כל הנתיבים הבאים דורשים התחברות
  { path: 'create-site',      component: CreateSiteComponent, canActivate: [authGuard] },
  { path: 'editor/:id',       component: EditorComponent,     canActivate: [authGuard] },
  { path: 'bookings/:siteId', component: BookingsComponent , canActivate: [authGuard] },

  // דף ציבורי — מציג את האתר לגולשים
  { path: 'site/:subdomain',           component: SiteViewerComponent },
  { path: 'site/:subdomain/:pageSlug', component: SiteViewerComponent },

  // כל נתיב לא מוכר — חזרה לדף הבית
  { path: '**', redirectTo: 'home' },
];