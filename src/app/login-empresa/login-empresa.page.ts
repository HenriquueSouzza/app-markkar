/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login-empresa',
  templateUrl: './login-empresa.page.html',
  styleUrls: ['./login-empresa.page.scss'],
})
export class LoginEmpresaPage implements OnInit {
  //strings html span
  cnpjErr: string;
  err: string;

  constructor(private service: LoginService) { }


  ngOnInit() {
    const teste = "conectado";
    if(teste === "conectado"){
      console.log("conectado");
    }
  }

  enviarLogin(form: NgForm){
    const login = form.value;
    if(login.cnpj.length - 14){
      console.log('cnpj incorreto');
      this.cnpjErr = "CNPJ incorreto";
    }
    else{
      this.cnpjErr = null;
      this.service.firstlogin(login).subscribe(response =>{
        if(response["dataBase"] == null){
          this.err = "CNPJ ou Senha não encontrados";
        }
        else{
          this.err = null;
          console.log("Banco de dados =",response["dataBase"]);
        }
      });
    }
  }
}
