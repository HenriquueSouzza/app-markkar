import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface interfaceFaturamento {
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

  faturamento(intFat: interfaceFaturamento) {
    return this.http.post(this.url, intFat);
  }
}
