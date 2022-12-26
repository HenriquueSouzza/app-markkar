import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VendaService {

  constructor(private http: HttpClient) { }

  iniciar(codEmp: string, codCc: string, codUser: string, cpf: string, codCliente: string){
    return this.http.post('http://192.168.0.15:8080/app/caixaMovel/venda/iniciar', {codEmp, codCc, codUser, cpf, codCliente});
  }

  buscarClientes(nome: string, cpf: string){
    return this.http.get('http://192.168.0.15:8080/app/caixaMovel/venda/cliente/buscar', {params:{nome, cpf}});
  }

  cancelar(vendaId: string){
    return this.http.put('http://192.168.0.15:8080/app/caixaMovel/venda/cancelar', {vendaId});
  }
}
