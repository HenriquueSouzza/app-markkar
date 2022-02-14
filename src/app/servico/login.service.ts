import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface fLogin{
  cnpj: string;
  senha: string;
}
export interface Login{
  login: string;
  senha: string;
  bd: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private flurl = 'http://192.168.1.93/Flogin';
  private lurl = 'http://192.168.1.93/Login';
  constructor(private http: HttpClient) { }

  firstlogin(flogin: fLogin){
    return this.http.post(this.flurl, flogin);
  }
  login(login: Login){
    return this.http.post(this.lurl, login);
  }
}
