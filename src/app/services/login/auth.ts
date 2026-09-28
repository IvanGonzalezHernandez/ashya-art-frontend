// src/app/services/login/auth.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';

export interface AuthDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    const body: AuthDto = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body);
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  logout(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('token');
  }

  /** Hay token y no ha caducado. Si ha caducado o está mal formado, se borra. */
  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    const expiraEn = this.obtenerExpiracion(token);
    if (expiraEn === null || Date.now() >= expiraEn) {
      this.logout();
      return false;
    }
    return true;
  }

  /** El token del backend es base64url de "email:expiraEnMillis:firma". */
  private obtenerExpiracion(token: string): number | null {
    try {
      const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
      const partes = atob(base64).split(':');
      const expiraEn = Number(partes[1]);
      return partes.length === 3 && Number.isFinite(expiraEn) ? expiraEn : null;
    } catch {
      return null;
    }
  }
}
