/* eslint-disable @typescript-eslint/dot-notation */
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface login{
  login: string;
  senha: string;
  bd: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  empAtual: string;
  colorInput = 'white';
  keyHeight = false;
  keyHeightM = false;

  //strings html span
  errLogin: string;

  constructor(
    private menu: MenuController,
    private service: LoginService,
    public loadingController: LoadingController,
    private storage: Storage,
    private storageService: StorageService,
    private router: Router,
    public alertController: AlertController,
    private platform: Platform
    ) {
      this.platform.keyboardDidShow.subscribe(ev => {
        const { keyboardHeight } = ev;
        if(platform.height() <= 500){
          this.keyHeight = true;
        }
        else if(platform.height() <= 690){
          this.keyHeightM = true;
        }
      });
      this.platform.keyboardDidHide.subscribe(ev => {
        this.keyHeight = false;
        this.keyHeightM = false;
      });
     }

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    const login = await this.storage.get('login');
    this.empAtual = await this.storage.get('empresaAtual');
    const valIdToken = await this.storage.get('idToken');
    const valLogin = await this.storage.get('login');
    const valSenhaLogin = await this.storage.get('senha');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const valLogins = {user: valLogin, senha: valSenhaLogin, id_token: valIdToken};
    if(valIdToken !== null && valLogin !== null && valSenhaLogin !== null){
      this.service.login(valLogins).subscribe(async response =>{
        if(response['status'] === 'success'){
          this.errLogin = null;
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Você já possui um login salvo.',
            message: 'Deseja logar com' + ' ' + login.toUpperCase() + ' ' + '?',
            buttons: [
              {
                text: 'NÃO',
                role: 'cancel',
                cssClass: 'secondary',
                id: 'cancel-button',
                handler: () => {
                // navigator['app'].exitApp();
                }
              },
              {
                text: 'SIM',
                id: 'confirm-button',
                handler: () => {
                  this.router.navigateByUrl('/home', { replaceUrl: true });
                }
              }
            ]
          });
          await alert.present();
        }
        else if(response['status'] === 'failed'){
        }
        else if(response['status'] === 'errDB'){
          this.errLogin = 'Não foi possivel conectar com o servidor de dados';
        }
      }, async error => {
        this.errLogin ='falha ao conectar com o servidor';
      });
    }
  }

  async enviarLogin(form: NgForm){
    this.errLogin = null;
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    await loading.present();
    const login = form.value;
    if(login.user.length === 0){
      await loading.dismiss();
      this.errLogin = 'Digite um usuario';
    }
    else if(login.senha.length === 0){
      await loading.dismiss();
      this.errLogin = 'Digite uma senha';
    }
    else{
      login.user = login.user.trim();
      login.id_token = await this.storage.get('idToken');
      this.service.login(login).subscribe(async response =>{
        if(response['status'] === 'success'){
          this.errLogin = null;
          await this.storageService.set('login', login.user);
          await this.storageService.set('senha', login.senha);
          await loading.dismiss();
          this.router.navigateByUrl('/home', { replaceUrl: true });
        }
        else if(response['status'] === 'failed'){
          this.colorInput = 'red';
          this.errLogin = 'Login ou Senha não encontrados';
          await loading.dismiss();
        }
        else if(response['status'] === 'errDB'){
          this.errLogin = 'Não foi possivel conectar com o servidor de dados';
          await loading.dismiss();
        }
      }, async error => {
        await loading.dismiss();
        this.errLogin ='falha ao conectar com o servidor';
      });
    }
  }
  colorReset(){
    this.colorInput = 'white';
  }
}
