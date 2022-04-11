import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Cep{
  cep: string;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {

  constructor(private http: HttpClient) { }

  searchForCep(intCep: Cep){
    return this.http.get('https://viacep.com.br/ws/'+intCep+'/json');
  }
}
