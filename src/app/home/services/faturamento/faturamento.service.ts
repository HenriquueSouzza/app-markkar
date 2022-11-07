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
  private url = 'http://192.168.1.8/app/faturamento/unidades';

  constructor(
    private http: HttpClient
  ) { }

  faturamento(intFat: interfaceFaturamento, token: string) {
    return this.http.post(this.url, intFat,{
      headers: { Authorization: token },
    });
  }
}
