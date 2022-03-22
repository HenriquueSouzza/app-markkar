import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './servico/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  empresas: any;
  name: string;
  constructor(
    private storage: Storage,
    private storageService: StorageService,
    private router: Router
    ) {}

  async ngOnInit() {
    this.empresas = Object.values(await this.storage.get('empresas'));
    this.name = await this.storage.get('login');
  }

  async changeEmpresa(empresa, cnpj, token, idToken){
    await this.storageService.set('cnpj', cnpj);
    await this.storageService.set('token', token);
    await this.storageService.set('idToken', idToken);
    await this.storageService.set('empresaAtual', empresa);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  redirect(){
    this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
  }
}
setTimeout(() => {
  SplashScreen.hide();
}, 2000);
