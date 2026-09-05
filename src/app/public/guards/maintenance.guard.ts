import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { MaintenanceService } from '../../services/maintenance/maintenance';

export const maintenanceGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const maintenance = inject(MaintenanceService);

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
