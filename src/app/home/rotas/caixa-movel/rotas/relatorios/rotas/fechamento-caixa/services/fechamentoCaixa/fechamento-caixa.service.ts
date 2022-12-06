/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FechamentoCaixaService {

  private url = 'https://api.markkar.com.br/app/caixaMovel/relatorios/fechamentoCaixa?id=';

  constructor(private http: HttpClient) { }

  get(idCentroCusto: string, token: string){
    return this.http.get(this.url+idCentroCusto,{
      headers: { Authorization: token },
    });
  }
}
