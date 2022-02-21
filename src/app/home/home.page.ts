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
    const valFCNPJ = await this.storage.get('fCNPJ');
    const valFSenha = await this.storage.get('fSenha');
    const valDataBase = await this.storage.get('dataBase');
    const valLogin = await this.storage.get('login');
    const valSenhaLogin = await this.storage.get('senhaLogin');
    const validateLogin = {login: valLogin, senha: valSenhaLogin, bd: valDataBase};
    const validatefLogin = {cnpj: valFCNPJ, senha: valFSenha};
    if(valFLogin !== false){
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }
    else if(valDataBase !== null && valLogin !== null && valSenhaLogin !== null){
      this.service.login(validateLogin).subscribe(async response =>{
        if(response["status"] === 'success'){
        }
        else if(response["status"] === 'failed'){
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
        else if(response["status"] === 'errDB'){
          this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
        }
      });
    }
    else if(valFCNPJ !== null && valFSenha !== null){
      this.service.firstlogin(validatefLogin).subscribe(async response =>{
        if(response["dataBase"] == null){
          this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
        }
        else{
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      });
    }
    else{
      this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
    }
  }

  async logOut(): Promise<void>{
    await this.storage.remove("login");
    await this.storage.remove("senhaLogin");
    this.router.navigateByUrl('/login', { replaceUrl: true });
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
