/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';

@Component({
  selector: 'app-validate-login',
  templateUrl: './validate-login.page.html',
  styleUrls: ['./validate-login.page.scss'],
})
export class ValidateLoginPage implements OnInit {

  constructor(private router: Router, private storage: Storage, private storageService: StorageService, private service: LoginService, public loadingController: LoadingController) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
    message: 'carregando...'
    });
    await loading.present();
    const valFCNPJ = await this.storage.get('fCNPJ');
    const valFSenha = await this.storage.get('fSenha');
    const valDataBase = await this.storage.get('dataBase');
    const valLogin = await this.storage.get('login');
    const valSenhaLogin = await this.storage.get('senhaLogin');
    const validateLogin = {login: valLogin, senha: valSenhaLogin, bd: valDataBase};
    const validatefLogin = {cnpj: valFCNPJ, senha: valFSenha};
    if(valDataBase !== null && valLogin !== null && valSenhaLogin !== null){
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
          this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
          await loading.dismiss();
        }
      });
    }
    else if(valFCNPJ !== null && valFSenha !== null){
      this.service.firstlogin(validatefLogin).subscribe(async response =>{
        if(response["dataBase"] == null){
          await loading.dismiss();
          this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
        }
        else{
          await loading.dismiss();
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      });
    }
    else{
      await loading.dismiss();
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }
  }
}
