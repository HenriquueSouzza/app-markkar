/* eslint-disable @typescript-eslint/naming-convention */
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
  cnpj: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private flurl = 'https://apimarkkar.igrejabatistamundial.com/app/auth/loginEmpresarial';
  private lurl = 'https://apimarkkar.igrejabatistamundial.com/app/auth/login';
  private vAtappurl = 'https://apimarkkar.igrejabatistamundial.com/app/auth/vAtapp';

  /*private flurl = 'http://192.168.1.30/app/auth/loginEmpresarial';
  private lurl = 'http://192.168.1.30/app/auth/login';
  private vAtappurl = 'http://192.168.1.30/app/auth/vAtapp';*/

  constructor(private http: HttpClient) { }

  firstlogin(loginEmp: loginEmpresarial) {
    return this.http.post(this.flurl, loginEmp);
  }
  login(login: Login) {
    return this.http.post(this.lurl, login);
  }
  vAtapp(token: string){
    return this.http.get(this.vAtappurl, {
      headers: { Authorization: token },
    });
  }
}
