/* eslint-disable @typescript-eslint/dot-notation */
import { CepService } from './servico/cep.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatform, ToastController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './servico/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  empresaAtual: string;
  empresas: any;
  unidades: any;
  name: string;
  modalOpCl = false;
  platform = isPlatform('ios');

  constructor(
    private storage: Storage,
    private storageService: StorageService,
    private router: Router,
    public toastController: ToastController,
    public searchCep: CepService,
    public alertController: AlertController
  ) {}

  async ngOnInit() {
    //this.searchStreet('22725030');
    this.empresaAtual = await this.storage.get('empresaAtual');
    this.empresas = Object.values(await this.storage.get('empresas'));
    this.unidades = await this.storage.get('unidadesCheck');
    this.name = await this.storage.get('login');
  }

  async changeEmpresa(empresa, cnpj, token, idToken) {
    await this.storageService.set('cnpj', cnpj);
    await this.storageService.set('token', token);
    await this.storageService.set('idToken', idToken);
    await this.storageService.set('empresaAtual', empresa);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  tt(tt){
    alert(tt);
  }

  redirect() {
    this.router.navigateByUrl('/login-empresa', { replaceUrl: false });
  }

  async deleteEmp(empresa, cnpj, token, idToken) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Remover Empresa',
      message: 'Você realmente deseja remover essa empresa do multiempresa ?',
      buttons: [
        {
          text: 'NÃO',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: () => {
            // navigator['app'].exitApp();
          },
        },
        {
          text: 'SIM',
          id: 'confirm-button',
          handler: async () => {
            const empresas = await this.storage.get('empresas');
            delete empresas[empresa];
            await this.storage.set('empresas', empresas);
            this.modalOpCl = false;
            const empresaReset = Object.values(
              await this.storage.get('empresas')
            );
            if (
              empresa === (await this.storage.get('empresaAtual')) &&
              cnpj === (await this.storage.get('cnpj')) &&
              token === (await this.storage.get('token')) &&
              idToken === (await this.storage.get('idToken'))
            ) {
              if (!empresaReset.hasOwnProperty(0)) {
                await this.storageService.set('cnpj', null);
                await this.storageService.set('token', null);
                await this.storageService.set('idToken', null);
                await this.storageService.set('empresaAtual', null);
                this.ngOnInit();
                this.router.navigateByUrl('/login-empresa', {
                  replaceUrl: true,
                });
              } else {
                await this.storageService.set('cnpj', empresaReset[0]['cnpj']);
                await this.storageService.set(
                  'token',
                  empresaReset[0]['token']
                );
                await this.storageService.set(
                  'idToken',
                  empresaReset[0]['idToken']
                );
                await this.storageService.set(
                  'empresaAtual',
                  empresaReset[0]['empresa']
                );
                this.ngOnInit();
                this.router.navigateByUrl('/login-empresa', {
                  replaceUrl: true,
                });
              }
            } else {
              this.ngOnInit();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark',
    });
    toast.present();
  }

  cnpjMask(cnpj) {
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }

  telMask(telNumber) {
    if (telNumber === null || telNumber === '') {
      return 'Não Cadastrado';
    } else {
      return telNumber.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  }

  nullEmail(email) {
    if (email === null || email === '') {
      return 'Não Cadastrado';
    } else {
      return email;
    }
  }

  searchStreet(cep) {
    this.searchCep.searchForCep(cep).subscribe((response) => {
      console.log(response);
    });
  }

  forUnids(val) {
    return Object.values(val);
  }
}
