/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login-empresa',
  templateUrl: './login-empresa.page.html',
  styleUrls: ['./login-empresa.page.scss'],
})
export class LoginEmpresaPage implements OnInit {
  //strings html span
  cnpjErr: string;
  err: string;
  colorCnpj: string;
  colorTOKEN: string;

  // eslint-disable-next-line max-len
  constructor(private menu: MenuController, private service: LoginService, private router: Router, public loadingController: LoadingController, private storageService: StorageService, private storage: Storage) { }


  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    const valCnpj = await this.storage.get('cnpj');
    const valToken = await this.storage.get('token');
    const validatefLogin = {cnpj: valCnpj, token: valToken};
    if(valCnpj !== null && valToken !== null){
      this.service.firstlogin(validatefLogin).subscribe(async response =>{
        if(response["status"] === "success"){
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
        else if(response["status"] === 'errDB'){
          alert("falha ao conectar com o servidor de dados");
        }
      }, async error => {
        alert("falha ao conectar com o servidor");
      });
    }
  }

  async enviarLogin(form: NgForm){
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    await loading.present();
    const login = form.value;
    if(login.cnpj.length !== 14){
      await loading.dismiss();
      this.cnpjErr = "Digite um CNPJ valido";
      this.colorCnpj = "danger";
    }
    else if(login.token.length === 0){
      await loading.dismiss();
      this.cnpjErr = null;
      this.colorCnpj = null;
      this.colorTOKEN = "danger";
      this.err = "Digite uma senha";
    }
    else{
      this.cnpjErr = null;
      this.colorTOKEN = null;
      this.colorCnpj = null;
      this.service.firstlogin(login).subscribe(async response =>{
        if(response["status"] === "failed"){
          this.colorTOKEN = "danger";
          this.colorCnpj = "danger";
          this.err = "CNPJ ou TOKEN invalido";
          await loading.dismiss();
        }
        else if(response["status"] === "blocked"){
          this.colorTOKEN = "danger";
          this.err = "TOKEN bloqueado";
          await loading.dismiss();
        }
        else if(response["status"] === "success"){
          this.err = null;
          this.colorTOKEN = null;
          this.colorCnpj = null;
          await this.storageService.set("fOpen", false);
          await this.storageService.set("cnpj", login.cnpj);
          await this.storageService.set("token", login.token);
          await loading.dismiss();
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      }, async error => {
        await loading.dismiss();
        this.err = "falha ao conectar com o servidor";
      });
    }
  }
}
