/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';


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
    else if(valLogin !== null && valSenhaLogin !== null && valCnpj !== null && valToken !== null && valIdToken !== null){
      this.service.firstlogin(validatefLogin).subscribe(async response =>{
        if(response["status"] === "failed" || response["status"] === "blocked"){
          this.error("errLogEmp");
        }
        else if(response["status"] === "success"){
          this.service.login(validateLogin).subscribe(async response =>{
            if(response["status"] === 'failed'){
              this.error("errLog");
            }
            else if(response["status"] === 'errDB'){
              this.error("serverdb");
            }
          }, async error => {
            this.error("server");
          });
        }
        else if(response["status"] === 'errDB'){
          this.error("serverdb");
        }
      }, async error => {
        this.error("server");
      });
    }
  }
  async logOut(): Promise<void>{
    await this.storage.remove("login");
    await this.storage.remove("senhaLogin");
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async error(err) {
    if(err === "server"){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: "Falha ao conectar com o servidor",
        message: 'Deseja tentar novamente ?',
        buttons: [
           {
            text: 'SAIR',
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
              this.ngOnInit();
            }
          }
        ]
      });
      await alert.present();
    }
    else if(err === "serverdb"){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: "Falha ao conectar com o servidor de dados",
        message: 'Deseja tentar novamente ?',
        buttons: [
          {
            text: 'SAIR',
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
              this.ngOnInit();
            }
          }
        ]
      });
      await alert.present();
    }
    else if(err === "errLogEmp"){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: "Falha ao logar na empresa",
        buttons: [
          {
            text: 'OK',
            id: 'confirm-button',
            handler: () => {
              this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
            }
          }
        ]
      });
      await alert.present();
    }
    else if(err === "errLog"){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: "Falha ao logar",
        buttons: [
          {
            text: 'OK',
            id: 'confirm-button',
            handler: () => {
              this.router.navigateByUrl('/login', { replaceUrl: true });
            }
          }
        ]
      });
      await alert.present();
    }
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
    this.ngOnInit();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
}
