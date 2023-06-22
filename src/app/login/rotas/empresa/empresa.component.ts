/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, isPlatform, LoadingController, MenuController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { LoginService } from '../../services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss'],
})
export class EmpresaComponent implements OnInit {
//strings html span
cnpjErr: string;
err: string;
colorCnpj: string;
colorTOKEN: string;
loader = false;
keyHeight = false;
keyHeightM = false;
private auth: any;

// eslint-disable-next-line max-len
constructor(
  private menu: MenuController,
  private service: LoginService,
  private router: Router,
  public loadingController: LoadingController,
  private storageService: StorageService,
  private storage: Storage,
  public alertController: AlertController,
  private platform: Platform
  ) {
    this.platform.keyboardDidShow.subscribe(ev => {
      const { keyboardHeight } = ev;
      if(!isPlatform('ios')){
        if(platform.height() <= 500){
          this.keyHeight = true;
        }
        else if(platform.height() <= 690){
          this.keyHeightM = true;
        }
      }
    });
    this.platform.keyboardDidHide.subscribe(ev => {
      this.keyHeight = false;
      this.keyHeightM = false;
    });
   }


async ngOnInit() {
  this.auth = await this.storage.get('auth');
  if(this.auth !== null && this.auth.hasOwnProperty('empresa')) {
    const valCnpj = this.auth.empresa.cnpj;
    const valToken = this.auth.empresa.token;
    const validatefLogin = {cnpj: valCnpj, token: valToken};
    if(valCnpj !== null && valToken !== null){
      this.service.firstlogin(validatefLogin).subscribe(async (response: any) =>{
        if(response.connection['status'] === 'success'){
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Você já possui uma empresa salva.',
            message: 'Deseja logar com' + ' ' + response.loginInformation['empresa'] + ' ' + '?',
            buttons: [
              {
                text: 'NÃO',
                role: 'cancel',
                cssClass: 'secondary',
                id: 'cancel-button',
                handler: () => {
                }
              },
              {
                text: 'SIM',
                id: 'confirm-button',
                handler: () => {
                  this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
                }
              }
            ]
          });
          await alert.present();
        }
        else if(response.connection['status'] === 'errDB'){
          this.error('serverdb');
        }
      }, async error => {
        this.error('server');
      });
    }
  }
}
colorReset(){
  this.colorCnpj = 'var(--ion-text-color);';
  this.colorTOKEN = 'var(--ion-text-color);';
}
async enviarLogin(form: NgForm){
  this.loader = true;
  const login = form.value;
  if(login.cnpj.length !== 14){
    this.loader = false;
    this.cnpjErr = 'Digite um CNPJ valido';
    this.colorCnpj = 'red';
  }
  else if(login.token.length === 0){
    this.loader = false;
    this.cnpjErr = null;
    this.colorCnpj = null;
    this.colorTOKEN = 'red';
    this.err = 'Digite uma senha';
  }
  else{
    this.err = null;
    this.cnpjErr = null;
    this.service.firstlogin(login).subscribe(async (response: any) =>{
      if(response.connection['status'] === 'failed'){
        this.colorTOKEN = 'red';
        this.colorCnpj = 'red';
        this.err = 'CNPJ ou TOKEN invalido';
        this.loader = false;
      }
      else if(response.connection['status'] === 'blocked'){
        this.colorTOKEN = 'red';
        this.err = 'TOKEN bloqueado';
        this.loader = false;
      }
      else if(response.connection['status'] === 'success'){
        this.err = null;
        this.colorTOKEN = 'var(--ion-text-color);';
        this.colorCnpj = 'var(--ion-text-color);';
        let auth = this.auth;
          if(auth === null){
            auth = {};
            auth.empresa = {
              cnpj: login.cnpj,
              token: login.token,
              id: response.loginInformation['id_token']
            };
          } else {
            auth.empresa = {
              cnpj: login.cnpj,
              token: login.token,
              id: response.loginInformation['id_token']
            };
          }
          await this.storage.set('auth', auth);
          const multiEmpresa = await this.storage.get('multiEmpresa');
          multiEmpresa.empresas[response.loginInformation['id_token']] = {
            empresa: response.loginInformation['empresa'],
            cnpj: login.cnpj,
            token: login.token,
            idToken: response.loginInformation['id_token'],
            telefone: response.loginInformation['telefone'],
            email: response.loginInformation['email']
          };
          await this.storage.set('multiEmpresa', multiEmpresa);
          const appConfig = await this.storage.get('appConfig');
          appConfig.firstOpen = false;
          appConfig.empresaAtual = response.loginInformation['empresa'];
          await this.storage.set('appConfig', appConfig);
        this.loader = false;
        this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
      }
      else if(response.connection['status'] === 'errDB'){
        this.loader = false;
        this.err ='falha ao conectar com o servidor de dados';
      }
    }, async error => {
      this.loader = false;
      this.err = 'falha ao conectar com o servidor';
    });
  }
}

//Tratamento de Erros
async error(err) {
  if(err === 'server'){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Falha ao conectar com o servidor',
      message: 'Deseja tentar novamente ?',
      backdropDismiss: false,
      buttons: [
         {
          text: 'SAIR',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: () => {
            navigator['app'].exitApp();
          }
        },
        {
          text: 'SIM',
          id: 'confirm-button',
          handler: () => {
            this.ngOnInit();
          }
        }
      ]
    });
    await alert.present();
  }
  else if(err === 'serverdb'){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Falha ao conectar com o servidor de dados',
      message: 'Deseja tentar novamente ?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'SAIR',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: () => {
          navigator['app'].exitApp();
          }
        },
        {
          text: 'SIM',
          id: 'confirm-button',
          handler: () => {
            this.ngOnInit();
          }
        }
      ]
    });
    await alert.present();
  }
  else if(err === 'errLogEmp'){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Falha ao logar na empresa',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          id: 'confirm-button',
          handler: () => {
            this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }
  else if(err === 'errLog'){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Falha ao logar',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          id: 'confirm-button',
          handler: () => {
            this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }
}

}
