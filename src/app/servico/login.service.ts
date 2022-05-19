import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';

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
  providedIn: 'root'
})
export class LoginService {
  private flurl = 'http://mkservidor.ddns.net:8080/Login-Empresarial';
  private lurl = 'http://mkservidor.ddns.net:8080/Login';

  constructor(private http: HttpClient) { }

  firstlogin(loginEmp: loginEmpresarial){
    return this.http.post(this.flurl, loginEmp);
  }
  login(login: Login){
    return this.http.post(this.lurl, login);
  }
}
