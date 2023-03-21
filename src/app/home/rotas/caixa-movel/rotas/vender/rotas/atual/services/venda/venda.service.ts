import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VendaService {

  constructor(private http: HttpClient) { }

  iniciar(codEmp: string, codCc: string, codUser: string, cpf: string, codCliente: string){
    console.log({codEmp, codCc, codUser, cpf, codCliente});
    return this.http.post('http://192.168.0.15:8080/app/caixaMovel/venda/iniciar', {codEmp, codCc, codUser, cpf, codCliente});
  }

  gravarBd(vendaAtual: any){
    console.log({vendaAtual});
    return this.http.put('http://192.168.0.15:8080/app/caixaMovel/venda/gravarBd', {vendaAtual});
  }

  finalizar(vendaAtual: any){
    console.log({vendaAtual});
    return this.http.put('http://192.168.0.15:8080/app/caixaMovel/venda/finalizar', {vendaAtual});
  }

  buscarClientes(nome: string, cpf: string){
    return this.http.get('http://192.168.0.15:8080/app/caixaMovel/venda/cliente/buscar', {params:{nome, cpf}});
  }

  cancelar(vendaId: string){
    return this.http.put('http://192.168.0.15:8080/app/caixaMovel/venda/cancelar', {vendaId});
  }

  buscarCaixasAbertos(vendaId: string){
    return this.http.get('http://192.168.0.15:8080/app/caixaMovel/venda/caixa/buscar?idVenda=' + vendaId);
  }
}
