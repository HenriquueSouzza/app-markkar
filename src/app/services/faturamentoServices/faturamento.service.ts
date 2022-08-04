import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface InterfaceFaturamento {
  cnpj: string;
  token: string;
  interval: string;
  date: string;
  cmvPercentage: string;
  dateInit: string;
  dateFinish: string;
  fourMonths: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaturamentoService {
  private url = 'https://api.markkar.com.br/Unidades';

  constructor(private http: HttpClient) { }

  faturamento(dadosParaBusca: InterfaceFaturamento) {
    return this.http.post(this.url, dadosParaBusca);
  }
}
