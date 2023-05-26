/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';

export interface InterfaceConsultaProduto {
  codeEmp: string;
  codeCC: string;
  codeBar: string | undefined | null;
  nome: string | undefined | null;
}
export interface InterfaceConsultaCentrosCustos {
  codeEmp: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {

  constructor(private http: HttpClient) { }

  isValidIPorLink(str) {
    const ipAddressPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const linkPattern = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(:[0-9]+)?$/;

    // Verifica se é um endereço IP válido
    if (ipAddressPattern.test(str)) {
      const octets = str.split('.');
      for (let i = 0; i < octets.length; i++) {
        const octet = parseInt(octets[i], 10);
        if (isNaN(octet) || octet < 0 || octet > 255) {
          return false;
        }
      }
      return true;
    }

    // Verifica se é um link válido
    if (linkPattern.test(str)) {
      const parts = str.split(':');
      const domain = parts[0];
      const port = parts[1];

      if (port !== undefined && (isNaN(port) || port < 0 || port > 65535)) {
        return false;
      }

      return true;
    }

    // Não é um IP válido nem um link válido
    return false;
  }

  consultaProduto(intProd: InterfaceConsultaProduto, ipLocal: string) {
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.post(`http://${ipLocal}/app/caixaMovel/estoque/produtos`, intProd);
  }

  consultaCC(intCC: InterfaceConsultaCentrosCustos, ipLocal: string){
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.post(`http://${ipLocal}/app/caixaMovel/estoque/centroscustos`, intCC);
  }
}
