/* eslint-disable quote-props */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export interface allFat{
  cnpj: string;
  token: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class LojasService {
  private url = 'http://192.168.1.93/Unidades';

  constructor(private http: HttpClient) { }

  allFat(allFat: allFat){
    return this.http.post(this.url, allFat);
  }
}
