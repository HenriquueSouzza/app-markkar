import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FechamentoCaixaService {

  private url = 'http://192.168.1.30/app/caixaMovel/relatorios/fechamentoCaixa?id=';

  constructor(private http: HttpClient) { }

  get(idCentroCusto: string){
    return this.http.get(this.url+idCentroCusto);
  }
}
