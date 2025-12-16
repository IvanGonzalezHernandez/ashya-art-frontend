import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly KEY = 'maintenance_unlocked';

  isEnabled(): boolean {
    return !!environment.maintenance;
  }

  isUnlocked(): boolean {
    return sessionStorage.getItem(this.KEY) === 'true';
  }

  unlock(pass: string): boolean {
    if (pass === environment.maintenancePassword) {
      sessionStorage.setItem(this.KEY, 'true');
      return true;
    }
    return false;
  }

  lock(): void {
    sessionStorage.removeItem(this.KEY);
  }
}
