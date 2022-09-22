import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage/storage.service';
@Injectable({
  providedIn: 'root'
})
export class EmpresaGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService, private storage: Storage){ }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    const appConfig = await this.storage.get('appConfig');
    const valFLogin = appConfig.firstOpen;
    if (valFLogin === false) {
      return true;
    } else {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return false;
    }
  }
}
