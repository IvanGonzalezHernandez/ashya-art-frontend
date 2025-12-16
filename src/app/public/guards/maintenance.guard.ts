import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MaintenanceService } from '../../services/maintenance/maintenance';

export const maintenanceGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const maintenance = inject(MaintenanceService);

  // Permitir entrar a la propia pantalla de mantenimiento
  if (state.url.startsWith('/maintenance')) return true;

  if (!maintenance.isEnabled()) return true;
  if (maintenance.isUnlocked()) return true;

  router.navigate(['/maintenance'], { queryParams: { redirect: state.url } });
  return false;
};
