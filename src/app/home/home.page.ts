/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatform, ToastController, AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  empresaAtual: string;
  empresas: any;
  unidades: any;
  name: string;
  modalOpCl = false;
  platform = isPlatform('ios');
  // storage
  private auth: any;
  private faturamentoStorage: any;
  private multiEmpresaStorage: any;
  private appConfigStorage: any;

  constructor(
    private storage: Storage,
    private storageService: StorageService,
    private router: Router,
    public toastController: ToastController,
    private navCtrl: NavController,
    public alertController: AlertController
  ) {}

  async ngOnInit() {
    //this.searchStreet('22725030');
    //loadStorage
    this.auth = await this.storage.get('auth');
    this.faturamentoStorage = await this.storage.get('faturamento');
    this.multiEmpresaStorage = await this.storage.get('multiEmpresa');
    this.appConfigStorage = await this.storage.get('appConfig');
    this.empresaAtual = this.appConfigStorage.empresaAtual;
    this.empresas = Object.values(this.multiEmpresaStorage.empresas);
    this.unidades = this.multiEmpresaStorage.empresas;
    this.name = this.auth.usuario.login;
  }

  async changeEmpresa(empresa, cnpj, token, idToken) {
    this.auth.empresa.cnpj = cnpj;
    this.auth.empresa.token = token;
    this.auth.empresa.id = idToken;
    this.auth.usuario.token = null;
    this.appConfigStorage.empresaAtual = empresa;
    await this.storageService.set('auth', this.auth);
    await this.storageService.set('appConfig', this.appConfigStorage);
    this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
  }

  async addEmp() {
    this.auth.usuario.token = null;
    await this.storageService.set('auth', this.auth);
    this.navCtrl.pop();
    this.router.navigateByUrl('/login/empresa', { replaceUrl: false });
  }

  async deleteEmp(empresa, cnpj, idToken) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Remover Empresa',
      message: `Você realmente deseja remover essa empresa do multiempresa ?`,
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
            const multiempresa = this.multiEmpresaStorage.empresas;
            const unidadesCheck = this.faturamentoStorage.unidadesCheck;
            delete multiempresa[idToken];
            delete unidadesCheck[idToken];
            this.multiEmpresaStorage.empresas = multiempresa;
            this.faturamentoStorage.unidadesCheck = unidadesCheck;
            await this.storage.set('multiEmpresa', this.multiEmpresaStorage);
            await this.storage.set('faturamento', this.faturamentoStorage);
            this.modalOpCl = false;
            const empresaReset = Object.values(
              this.multiEmpresaStorage.empresas
            );
            if (
              empresa === this.empresaAtual &&
              cnpj === this.auth.empresa.cnpj &&
              idToken === this.auth.empresa.id
            ) {
              if (!empresaReset.hasOwnProperty(0)) {
                await this.storage.remove('auth');
                this.navCtrl.pop();
                this.router.navigateByUrl('/login/empresa', {
                  replaceUrl: true,
                });
              } else {
                this.auth.empresa.cnpj = empresaReset[0]['cnpj'];
                this.auth.empresa.token = empresaReset[0]['token'];
                this.auth.empresa.id = empresaReset[0]['idToken'];
                this.appConfigStorage.empresaAtual = empresaReset[0]['empresa'];
                this.auth.usuario.token = null;
                await this.storageService.set('auth', this.auth);
                await this.storageService.set('appConfig', this.appConfigStorage);
                this.navCtrl.pop();
                this.router.navigateByUrl('/login/empresa', { replaceUrl: true, });
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

  forUnids(val) {
    if(val !== undefined){
      return Object.values(val['centrodecustos']);
    }
  }
}
