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

  constructor(private service: LoginService, public loadingController: LoadingController, private storage: Storage, private storageService: StorageService, private router: Router) {  }

  async ngOnInit() {
    const valDataBase = await this.storage.get('dataBase');
    const valLogin = await this.storage.get('login');
    const valSenhaLogin = await this.storage.get('senhaLogin');
    if(valDataBase !== null && valLogin !== null && valSenhaLogin !== null){
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  async enviarLogin(form: NgForm){
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    const login = form.value;
    if(login.login.length === 0){
      this.errLogin = "Digite um login";
    }
    else if(login.senha.length === 0){
      this.errLogin = "Digite uma senha";
    }
    else{
      login.bd = await this.storage.get('dataBase');
      this.service.login(login).subscribe(async response =>{
        await loading.present();
        if(response["status"] === 'success'){
          this.errLogin = null;
          await this.storageService.set("login", login.login);
          await this.storageService.set("senhaLogin", login.senha);
          await loading.dismiss();
          this.router.navigateByUrl('/home', { replaceUrl: true });

        }
        else if(response["status"] === 'failed'){
          this.errLogin = "Login ou Senha não encontrados";
          await this.storage.remove("login");
          await this.storage.remove("pass");
          await loading.dismiss();
        }
        else if(response["status"] === 'errDB'){
          this.errLogin = "Não foi possivel conectar com a empresa";
          await loading.dismiss();
        }
      });
    }
  }
}
