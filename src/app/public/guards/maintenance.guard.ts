import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { MaintenanceService } from '../../services/maintenance/maintenance';

export const maintenanceGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const maintenance = inject(MaintenanceService);

  // En el prerenderizado (build) se generan siempre las páginas; el mantenimiento se decide en el navegador
  if (isPlatformServer(inject(PLATFORM_ID))) return true;

  // Permitir entrar a la propia pantalla de mantenimiento
  if (state.url.startsWith('/maintenance')) return true;

  if (maintenance.isUnlocked()) return true;

  return maintenance.isEnabled().pipe(
    map(activo => {
      if (!activo) return true;
      router.navigate(['/maintenance'], { queryParams: { redirect: state.url } });
      return false;
    })
  );
};
