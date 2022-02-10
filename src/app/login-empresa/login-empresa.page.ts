/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login-empresa',
  templateUrl: './login-empresa.page.html',
  styleUrls: ['./login-empresa.page.scss'],
})
export class LoginEmpresaPage implements OnInit {
  //strings html span
  cnpjErr: string;
  err: string;

  constructor(private service: LoginService, private router: Router, public loadingController: LoadingController) { }


  ngOnInit() {
    const teste = "conectado";
    if(teste === "conectado"){
      console.log("conectado");
    }
  }

  async enviarLogin(form: NgForm){
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    const login = form.value;
    if(login.cnpj.length !== 14){
      console.log('cnpj incorreto');
      this.cnpjErr = "Digite um CNPJ valido";
    }
    else if(login.senha.length === 0){
      this.cnpjErr = null;
      console.log('Campo de senha vazio');
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
          console.log("Banco de dados =",response["dataBase"]);
          this.router.navigateByUrl('/login', { replaceUrl: true });
          await loading.dismiss();
        }
      });
    }
  }
}
