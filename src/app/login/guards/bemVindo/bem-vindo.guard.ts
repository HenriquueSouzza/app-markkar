import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class BemVindoGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService, private storage: Storage){ }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean > {
    const valFLogin = await this.storage.get('fOpen');
    if (valFLogin !== false) {
      return true;
    } else {
      this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
      return false;
    }
  }
}