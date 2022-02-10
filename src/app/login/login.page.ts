/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

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

  constructor(private service: LoginService) { }

  ngOnInit() {
  }


  enviarLogin(form: NgForm){
    const login = form.value;
    login.bd = "markkar";
    this.service.login(login).subscribe(response =>{
      if(response["status"] === 'success'){
        console.log("conectado");
        this.errLogin = null;
      }
      else if(response["status"] === 'failed'){
        console.log("usuario não encontrado");
        this.errLogin = "Login ou Senha não encontrados";
      }
      else if(response["status"] === 'errDB'){
        console.log("Erro ao conectar com o banco de dados");
        this.errLogin = "Não foi possivel conectar com a empresa";
      }
    });

  }
}
