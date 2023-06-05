/* eslint-disable @typescript-eslint/prefer-for-of */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VendaService {
  constructor(private http: HttpClient) {}

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

  iniciar(
    codEmp: string,
    codCc: string,
    codUser: string,
    cpf: string,
    codCliente: string,
    ipLocal: string
  ) {
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.post(`http://${ipLocal}/app/caixaMovel/venda/iniciar`, {
      codEmp,
      codCc,
      codUser,
      cpf,
      codCliente,
    });
  }

  gravarBd(vendaAtual: any, ipLocal: string) {
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.put(`http://${ipLocal}/app/caixaMovel/venda/gravarBd`, {
      vendaAtual,
    });
  }

  finalizar(vendaAtual: any, ipLocal: string) {
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.put(`http://${ipLocal}/app/caixaMovel/venda/finalizar`, {
      vendaAtual,
    });
  }

  buscarClientes(nome: string, cpf: string, ipLocal: string) {
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.get(
      `http://${ipLocal}/app/caixaMovel/venda/cliente/buscar`,
      { params: { nome, cpf } }
    );
  }

  cadastrarCliente(
    codEmp: string,
    nome: string,
    cpf: string,
    telefone: string | null,
    email: string | null,
    ipLocal: string
  ) {
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.post(`http://${ipLocal}/app/caixaMovel/venda/cliente/cadastrar`, {
      codEmp,
      nome,
      cpf,
      telefone,
      email
    });
  }

  cancelar(vendaId: string, ipLocal: string) {
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.put(`http://${ipLocal}/app/caixaMovel/venda/cancelar`, {
      vendaId,
    });
  }

  buscarCaixasAbertos(vendaId: string, ipLocal: string) {
    if (!this.isValidIPorLink(ipLocal)) {
      return throwError(() => new Error('Endereço IP local não definido'));
    }
    return this.http.get(
      `http://${ipLocal}/app/caixaMovel/venda/caixa/buscar?idVenda=` + vendaId
    );
  }
}
