import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatform, ToastController } from '@ionic/angular';
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
  modalOpCl = false;
  platform = isPlatform('android');

  constructor(
    private storage: Storage,
    private storageService: StorageService,
    private router: Router,
    public toastController: ToastController
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
    this.router.navigateByUrl('/login-empresa', { replaceUrl: false });
  }

  async deleteEmp(empresa, cnpj, token, idToken){
    const empresas = await this.storage.get('empresas');
    if(empresa === await this.storage.get('empresaAtual') &&
    cnpj === await this.storage.get('cnpj') &&
    token === await this.storage.get('token') &&
    idToken === await this.storage.get('idToken')
    ){
      await this.storageService.set('cnpj', '');
      await this.storageService.set('token', '');
      await this.storageService.set('idToken', '');
      await this.storageService.set('empresaAtual', '');
      delete empresas[empresa];
      await this.storage.set('empresas', empresas);
      this.ngOnInit();
      this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
    }else{
      delete empresas[empresa];
      await this.storage.set('empresas', empresas);
      this.ngOnInit();
    }
  }

  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark'
    });
    toast.present();
  }
}
