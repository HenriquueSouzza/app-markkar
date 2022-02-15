/* eslint-disable quote-props */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, HttpOptions, HttpResponse } from '@capacitor-community/http';

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
  private flurl = 'https://192.168.1.93/Flogin';
  private lurl = 'https://192.168.1.93/Login';

  constructor(private http: HttpClient) { }

  firstlogin(flogin: fLogin){
    return this.http.post(this.flurl, flogin);
  }
  login(login: Login){
    return this.http.post(this.lurl, login);
  }

  //testes de error de cors
  /*async doPost(content: string){
    const options = {
      url: 'http://192.168.1.93/Flogin',
      headers: {},
      data: content,
    };

    const response: HttpResponse = await Http.post(options);
    console.log(response);
    console.log(response.status);
    console.log(response.data);
    console.log(response.headers);
  }*/
}
