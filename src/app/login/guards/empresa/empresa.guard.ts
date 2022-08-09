import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
@Injectable({
  providedIn: 'root'
})
export class EmpresaGuard implements CanActivate {

  constructor(private router: Router, private storage: Storage){ }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean > {
    const valFLogin = await this.storage.get('fOpen');
    if (valFLogin === false) {
      return true;
    } else {
      this.router.navigateByUrl('/login/bemVindo', { replaceUrl: true });
    }
  }
}
