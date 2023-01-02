import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CaixaService {

  constructor(private http: HttpClient) { }

  buscar(vendaId: string){
    return this.http.get('http://192.168.0.15:8080/app/caixaMovel/venda/caixa/buscar?idVenda=' + vendaId);
  }
}
