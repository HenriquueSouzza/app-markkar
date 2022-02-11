/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
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

  // eslint-disable-next-line max-len
  constructor(private service: LoginService, private router: Router, public loadingController: LoadingController, private storageService: StorageService, private storage: Storage) { }


  async ngOnInit() {
  }

  async enviarLogin(form: NgForm){
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    const login = form.value;
    if(login.cnpj.length !== 14){
      this.cnpjErr = "Digite um CNPJ valido";
    }
    else if(login.senha.length === 0){
      this.cnpjErr = null;
      this.err = "Digite uma senha";
    }
    else{
      await loading.present();
      this.cnpjErr = null;
      this.service.firstlogin(login).subscribe(async response =>{
        if(response["dataBase"] == null){
          this.err = "CNPJ ou Senha não encontrados";
          await loading.dismiss();
        }
        else{
          this.err = null;
          await this.storageService.set("bd", response["dataBase"]);
          await loading.dismiss();
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      });
    }
  }
}
