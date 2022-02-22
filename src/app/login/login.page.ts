/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
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
  //strings html span
  errLogin: string;

  constructor(private menu: MenuController, private service: LoginService, public loadingController: LoadingController, private storage: Storage, private storageService: StorageService, private router: Router) {  }

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    const valIdToken = await this.storage.get('idToken');
    const valLogin = await this.storage.get('login');
    const valSenhaLogin = await this.storage.get('senha');
    if(valIdToken !== null && valLogin !== null && valSenhaLogin !== null){
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  async enviarLogin(form: NgForm){
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    const login = form.value;
    if(login.user.length === 0){
      this.errLogin = "Digite um usuario";
    }
    else if(login.senha.length === 0){
      this.errLogin = "Digite uma senha";
    }
    else{
      login.id_token = await this.storage.get('idToken');
      this.service.login(login).subscribe(async response =>{
        await loading.present();
        if(response["status"] === 'success'){
          this.errLogin = null;
          await this.storageService.set("login", login.user);
          await this.storageService.set("senha", login.senha);
          await loading.dismiss();
          this.router.navigateByUrl('/home', { replaceUrl: true });

        }
        else if(response["status"] === 'failed'){
          this.errLogin = "Login ou Senha não encontrados";
          await loading.dismiss();
        }
        else if(response["status"] === 'errDB'){
          this.errLogin = "Não foi possivel conectar com o servidor de dados";
          await loading.dismiss();
        }
      }, async error => {
        await loading.dismiss();
        this.errLogin ="falha ao conectar com o servidor";
      });
    }
  }
}
