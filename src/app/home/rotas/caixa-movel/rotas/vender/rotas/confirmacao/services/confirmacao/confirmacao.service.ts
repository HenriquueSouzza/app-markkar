import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmacaoService {

  constructor(private http: HttpClient) { }

  finalizar(vendaAtual: string){
    return this.http.put('http://192.168.0.15:8080/app/caixaMovel/venda/finalizar', {vendaAtual});
  }
}
