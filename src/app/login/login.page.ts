/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoadingController } from '@ionic/angular';

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

  constructor(private service: LoginService, public loadingController: LoadingController) { }

  ngOnInit() {
  }

  //fazer else if de input em branco
  async enviarLogin(form: NgForm){
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    const login = form.value;
    login.bd = "markkar";
    this.service.login(login).subscribe(async response =>{
      await loading.present();
      if(response["status"] === 'success'){
        console.log("conectado");
        this.errLogin = null;
        await loading.dismiss();
      }
      else if(response["status"] === 'failed'){
        console.log("usuario não encontrado");
        this.errLogin = "Login ou Senha não encontrados";
        await loading.dismiss();
      }
      else if(response["status"] === 'errDB'){
        console.log("Erro ao conectar com o banco de dados");
        this.errLogin = "Não foi possivel conectar com a empresa";
        await loading.dismiss();
      }
    });

  }
}
