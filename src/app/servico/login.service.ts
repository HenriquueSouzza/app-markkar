import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs/operators';

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
  private flurl = 'https://app.markkar.com.br/Login-Empresarial';
  private lurl = 'https://app.markkar.com.br/Login';

  constructor(private http: HttpClient) {
    this.http
      .post(this.flurl, { teste: 'oi' }, { observe: 'response' })
      .pipe(timeout(10000))
      .subscribe(
        (response) => {
        },
        async (error) => {
          if(error.name === 'TimeoutError'){
            this.flurl = 'http://mkservidor.ddns.net:8080/Login-Empresarial';
            this.lurl = 'http://mkservidor.ddns.net:8080/Login';
          }
        }
      );
  }

  firstlogin(loginEmp: loginEmpresarial){
    return this.http.post(this.flurl, loginEmp);
  }
  login(login: Login){
    return this.http.post(this.lurl, login);
  }
}
