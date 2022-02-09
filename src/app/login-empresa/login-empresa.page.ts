import { LoginService } from './../servico/login.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login-empresa',
  templateUrl: './login-empresa.page.html',
  styleUrls: ['./login-empresa.page.scss'],
})
export class LoginEmpresaPage implements OnInit {

  constructor(private service: LoginService) { }

  ngOnInit() {
  }

  enviarLogin(form: NgForm){
    const login = form.value;
    if(login.cnpj.length - 14){
      console.log('cnpj incorreto');
    }
    else{
      this.service.firstlogin(login).subscribe(response =>{
        console.log(response);
      });
    }
  }
}
