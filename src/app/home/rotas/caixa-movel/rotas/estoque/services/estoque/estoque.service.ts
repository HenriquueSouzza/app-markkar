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

  consultaProduto(intProd: InterfaceConsultaProduto, ipLocal: string) {
    if (!this.isIPv4(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.post(`http://${ipLocal}/app/caixaMovel/estoque/produtos`, intProd);
  }

  consultaCC(intCC: InterfaceConsultaCentrosCustos, ipLocal: string){
    if (!this.isIPv4(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.post(`http://${ipLocal}/app/caixaMovel/estoque/centroscustos`, intCC);
  }
}
