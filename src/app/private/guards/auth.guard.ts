import { Injectable } from '@angular/core';
import { CanActivate,CanActivateChild,ActivatedRouteSnapshot,RouterStateSnapshot,Router } from '@angular/router';
import { AuthService } from '../../services/login/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): boolean {
    if (this.authService.estaAutenticado()) {
      return true;
    }

    // Si no está logueado → lo mando al login
    this.router.navigate(['/private/login'], {
      queryParams: { returnUrl: url }
    });
    return false;
  }
}
