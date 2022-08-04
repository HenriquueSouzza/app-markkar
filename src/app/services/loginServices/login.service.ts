
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface InterfaceLoginEmpresa{
  cnpj: string;
  token: string;
}
export interface InterfaceLoginUsuario{
  user: string;
  senha: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  id_token: string;
}

@Injectable({
  providedIn: 'root'
})

export class LoginService {
  private urlLoginEmpresa = 'https://api.markkar.com.br/Login-Empresarial';
  private urlLoginUsuario = 'https://api.markkar.com.br/Login';

  constructor(private http: HttpClient) { }

  loginEmpresa(loginEmpresa: InterfaceLoginEmpresa){
    return this.http.post(this.urlLoginEmpresa, loginEmpresa);
  }
  loginUsuario(loginUsuario: InterfaceLoginUsuario){
    return this.http.post(this.urlLoginUsuario, loginUsuario);
  }
}
