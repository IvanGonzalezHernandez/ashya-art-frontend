import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/login/auth';

/**
 * Si una petición con token de admin vuelve 401/403 (token caducado o inválido, p. ej. tras
 * reiniciar el backend con otro secreto), se cierra la sesión y se manda al login.
 */
export const authExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      const conToken = req.headers.has('Authorization');
      if (conToken && err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        authService.logout();
        if (!router.url.startsWith('/private/login')) {
          router.navigate(['/private/login'], { queryParams: { returnUrl: router.url } });
        }
      }
      return throwError(() => err);
    })
  );
};
