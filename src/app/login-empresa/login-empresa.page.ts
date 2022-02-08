import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-empresa',
  templateUrl: './login-empresa.page.html',
  styleUrls: ['./login-empresa.page.scss'],
})
export class LoginEmpresaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  goToUrl(){
    document.location.href = '/login';
  }
}
