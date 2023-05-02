import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
@Injectable({
  providedIn: 'root',
})
export class HomeGuard implements CanActivate {
  constructor(
    private router: Router,
    private storageService: StorageService,
    private storage: Storage
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const auth = await this.storage.get('auth');
    if (auth.hasOwnProperty('usuario')) {
      const valIdToken = auth.empresa.token;
      const valLogin = auth.usuario.login;
      const valTokenLogin = auth.usuario.token;
      if (
        valLogin !== null &&
        valTokenLogin !== null &&
        valIdToken !== null &&
        valLogin !== undefined &&
        valTokenLogin !== undefined &&
        valIdToken !== undefined
      ) {
        return true;
      } else {
        this.router.navigateByUrl('/login', { replaceUrl: true });
        return false;
      }
    } else {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return false;
    }
  }
}
