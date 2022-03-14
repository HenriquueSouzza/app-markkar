/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';

@Component({
  selector: 'app-validate-login',
  templateUrl: './validate-login.page.html',
  styleUrls: ['./validate-login.page.scss'],
})
export class ValidateLoginPage implements OnInit {

  btn: string;

  constructor(private menu: MenuController, private router: Router, private storage: Storage, private storageService: StorageService, private service: LoginService, public loadingController: LoadingController) { }

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    this.btn = "none";
    const loading = await this.loadingController.create({
    message: 'carregando...'
    });
    await loading.present();
    const valFLogin = await this.storage.get('fOpen');
    const valCnpj = await this.storage.get('cnpj');
    const valToken = await this.storage.get('token');
    const valIdToken = await this.storage.get('idToken');
    const valLogin = await this.storage.get('login');
    const valSenhaLogin = await this.storage.get('senha');
    const validateLogin = {user: valLogin, senha: valSenhaLogin, id_token: valIdToken};
    const validatefLogin = {cnpj: valCnpj, token: valToken};
    if(valFLogin !== false){
      await this.storage.set("intervalHeader", "month");
      await this.storage.set("interval", "day");
      await this.storage.set("mask", true);
      await this.storage.set("cmvPerc", true);
      await loading.dismiss();
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }
    else if(valLogin !== null && valSenhaLogin !== null){
      this.service.login(validateLogin).subscribe(async response =>{
        if(response["status"] === 'success'){
          await loading.dismiss();
          this.router.navigateByUrl('/home', { replaceUrl: true });
        }
        else if(response["status"] === 'failed'){
          await loading.dismiss();
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
        else if(response["status"] === 'errDB'){
          await loading.dismiss();
          this.btn = 'block';
          alert("falha ao conectar com o servidor de dados");
        }
      }, async error => {
        await loading.dismiss();
        this.btn = 'block';
        alert("falha ao conectar com o servidor");
      });
    }
    else if(valCnpj !== null && valToken !== null){
      this.service.firstlogin(validatefLogin).subscribe(async response =>{
        if(response["status"] === "failed"){
          await loading.dismiss();
          this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
        }
        else if(response["status"] === "blocked"){
          await loading.dismiss();
          this.router.navigateByUrl('/token-block', { replaceUrl: true });
        }
        else if(response["status"] === "success"){
          await loading.dismiss();
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
        else if(response["status"] === 'errDB'){
          await loading.dismiss();
          this.btn = 'block';
          alert("falha ao conectar com o servidor de dados");
        }
      }, async error => {
        await loading.dismiss();
        this.btn = 'block';
        alert("falha ao conectar com o servidor");
      });
    }
    else{
      await loading.dismiss();
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }
  }
}
