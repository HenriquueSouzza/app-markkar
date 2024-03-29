/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface interfaceFaturamento {
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
  //private url = 'http://192.168.0.15:8080/app/faturamento/unidades';
  private url = 'https://api.markkar.com.br/app/faturamento/unidades';

  constructor(
    private http: HttpClient
  ) { }

  faturamento(intFat: interfaceFaturamento, token: string) {
    return this.http.post(this.url, intFat,{
      headers: { Authorization: token },
    });
  }
}
