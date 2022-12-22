import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private url = 'http://192.168.0.15:8080/app/caixaMovel/venda/procurarCliente';

  constructor(private http: HttpClient) { }

  getClientes(nome: string, cpf: string){
    return this.http.get(this.url, {params:{nome, cpf}});
  }
}
