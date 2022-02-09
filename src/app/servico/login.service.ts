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
  private url = 'http://192.168.1.93/firstLogin.php';

  constructor(private http: HttpClient) { }

  firstlogin(login: Login){
    return this.http.post(this.url, login);
  }
}
