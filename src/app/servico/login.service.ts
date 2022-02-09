import { Login } from './login.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Login{
  cnpj: string;
  senha: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private urlFrtLogin = 'http://192.168.1.93/firstLogin.php';
  private urlLogin = '';
  constructor(private http: HttpClient) { }

  firstlogin(login: Login){
    return this.http.post(this.urlFrtLogin, login);
  }
  //terminar isso
  Login(login: Login){
    return this.http.post(this.urlLogin, login);
  }
}
