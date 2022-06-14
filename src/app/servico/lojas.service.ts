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
  providedIn: 'root',
})
export class LojasService {
  private url = 'https://app.markkar.com.br/Unidades';
  private url2 = 'http://mkservidor.ddns.net:8080/Unidades';
  private urlFinal = this.url;

  constructor(private http: HttpClient) {
    this.http
      .post(this.url2, { teste: 'oi' }, { observe: 'response' })
      .pipe(timeout(10000))
      .subscribe(
        (response) => {
        },
        async (error) => {
          if(error.name === 'TimeoutError'){
            this.urlFinal = this.url2;
          }
        }
      );
  }

  faturamento(intFat: interfaceFaturamento) {
    return this.http.post(this.urlFinal, intFat);
  }
}
