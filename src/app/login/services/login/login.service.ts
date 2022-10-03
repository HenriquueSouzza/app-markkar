import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface loginEmpresarial{
  cnpj: string;
  token: string;
}
export interface Login{
  user: string;
  senha: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  id_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private flurl = 'https://api.markkar.com.br/app/auth/loginEmpresarial';
  private lurl = 'https://api.markkar.com.br/app/auth/login';

  /*private flurl = 'http://192.168.1.11/app/auth/loginEmpresarial';
  private lurl = 'http://192.168.1.11/app/auth/login';*/

  constructor(private http: HttpClient) { }

  firstlogin(loginEmp: loginEmpresarial) {
    return this.http.post(this.flurl, loginEmp);
  }
  login(login: Login) {
    return this.http.post(this.lurl, login);
  }
}
