/* eslint-disable quote-props */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export interface Lojas{
  id_token: string;
}


@Injectable({
  providedIn: 'root'
})
export class LojasService {
  private url = 'http://192.168.1.93/api/lojas.php';

  constructor(private http: HttpClient) { }

  all(lojas: Lojas){
    return this.http.post(this.url, lojas);
  }
}
