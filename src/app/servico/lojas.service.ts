/* eslint-disable quote-props */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export interface interfaceFaturamento{
  cnpj: string;
  token: string;
  interval: string;
  date: string;
  cmvPercentage: string;
  dateInit: string;
  dateFinish: string;
}

@Injectable({
  providedIn: 'root'
})
export class LojasService {
  private url = 'http://portal-markkar.herokuapp.com/Unidades';

  constructor(private http: HttpClient) { }

  faturamento(intFat: interfaceFaturamento){
    return this.http.post(this.url, intFat);
  }
}
