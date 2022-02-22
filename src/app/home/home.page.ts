/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private service: LoginService, public loadingController: LoadingController, private menu: MenuController, private storage: Storage, private storageService: StorageService, private router: Router, public alertController: AlertController) { }

  async ngOnInit() {
    this.menu.enable(true, 'homeMenu');
    const valFLogin = await this.storage.get('fOpen');
    const valCnpj = await this.storage.get('cnpj');
    const valToken = await this.storage.get('token');
    const valIdToken = await this.storage.get('idToken');
    const valLogin = await this.storage.get('login');
    const valSenhaLogin = await this.storage.get('senha');
    const validateLogin = {user: valLogin, senha: valSenhaLogin, id_token: valIdToken};
    const validatefLogin = {cnpj: valCnpj, token: valToken};
    if(valFLogin !== false){
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }
    else if(valLogin !== null && valSenhaLogin !== null){
      this.service.login(validateLogin).subscribe(async response =>{
        if(response["status"] === 'success'){
          this.router.navigateByUrl('/home', { replaceUrl: true });
        }
        else if(response["status"] === 'failed'){
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
        else if(response["status"] === 'errDB'){
          this.errorLogin("falha ao conectar com o servidor de dados");
        }
      }, async error => {
        this.errorLogin("falha ao conectar com o servidor");
      });
    }
    else if(valCnpj !== null && valToken !== null){
      this.service.firstlogin(validatefLogin).subscribe(async response =>{
        if(response["status"] === "failed"){
          this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
        }
        else if(response["status"] === "blocked"){
          this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
        }
        else if(response["status"] === "success"){
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
        else if(response["status"] === 'errDB'){
          this.errorLogin("falha ao conectar com o servidor de dados");
        }
      }, async error => {
        this.errorLogin("falha ao conectar com o servidor");
      });
    }
    else{
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }
  }
  async logOut(): Promise<void>{
    await this.storage.remove("login");
    await this.storage.remove("senhaLogin");
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async errorLogin(err) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: err,
      message: 'Deseja tentar novamente ?',
      buttons: [
        {
          text: 'NÃO',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button'
        }, {
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

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Desconectar',
      message: 'Você realmente deseja desconectar da sua conta ?',
      buttons: [
        {
          text: 'NÃO',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button'
        }, {
          text: 'SIM',
          id: 'confirm-button',
          handler: () => {
            this.logOut();
          }
        }
      ]
    });
    await alert.present();
  }
  doRefresh(event) {
    //func
    setTimeout(() => {
      //returm
      event.target.complete();
    }, 2000);
  }
}
