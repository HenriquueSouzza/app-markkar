import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FechamentoCaixaService {

  private url = 'https://apimarkkar.igrejabatistamundial.com/app/caixaMovel/relatorios/fechamentoCaixa?id=';

  constructor(private http: HttpClient) { }

  get(idCentroCusto: string){
    return this.http.get(this.url+idCentroCusto);
  }
}
