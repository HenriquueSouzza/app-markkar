/* eslint-disable @typescript-eslint/prefer-for-of */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendaService {

   constructor(private http: HttpClient) { }

   isIPv4(str) {
    const pattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]+)?$/;
    if (!pattern.test(str)) {
      return false;
    }
    const parts = str.split(':');
    const ipAddress = parts[0];
    const port = parts[1] ? parseInt(parts[1], 10) : null;
    const octets = ipAddress.split('.');
    for (let i = 0; i < octets.length; i++) {
      const octet = parseInt(octets[i], 10);
      if (isNaN(octet) || octet < 0 || octet > 255) {
        return false;
      }
    }
    if (port !== null && (isNaN(port) || port < 0 || port > 65535)) {
      return false;
    }
    return true;
  }

  iniciar(codEmp: string, codCc: string, codUser: string, cpf: string, codCliente: string, ipLocal: string){
    if (!this.isIPv4(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.post(`http://${ipLocal}/app/caixaMovel/venda/iniciar`, {codEmp, codCc, codUser, cpf, codCliente});
  }

  gravarBd(vendaAtual: any, ipLocal: string){
    if (!this.isIPv4(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.put(`http://${ipLocal}/app/caixaMovel/venda/gravarBd`, {vendaAtual});
  }

  finalizar(vendaAtual: any, ipLocal: string){
    if (!this.isIPv4(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.put(`http://${ipLocal}/app/caixaMovel/venda/finalizar`, {vendaAtual});
  }

  buscarClientes(nome: string, cpf: string, ipLocal: string){
    if (!this.isIPv4(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.get(`http://${ipLocal}/app/caixaMovel/venda/cliente/buscar`, {params:{nome, cpf}});
  }

  cancelar(vendaId: string, ipLocal: string){
    if (!this.isIPv4(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.put(`http://${ipLocal}/app/caixaMovel/venda/cancelar`, {vendaId});
  }

  buscarCaixasAbertos(vendaId: string, ipLocal: string){
    if (!this.isIPv4(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.get(`http://${ipLocal}/app/caixaMovel/venda/caixa/buscar?idVenda=` + vendaId);
  }
}
