import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService, private storage: Storage){ }

 async canActivate(
   route: ActivatedRouteSnapshot,
   state: RouterStateSnapshot): Promise<boolean> {
     const auth = await this.storage.get('auth');
     if(auth.hasOwnProperty('empresa')) {
      const valCnpj = auth.empresa.cnpj;
      const valToken = auth.empresa.token;
      if(valCnpj !== null && valToken !== null){
        return true;
      } else {
        this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
        return false;
      }
    } else {
      this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
        return false;
    }
  }
}
