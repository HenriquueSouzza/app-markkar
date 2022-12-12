/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
  private url = 'http://192.168.1.30/app/caixaMovel/venda/formasPagamento?id=';

  constructor(private http: HttpClient) { }

  all(idEmp: string) {
    return this.http.get(this.url + idEmp);
  }

  pgmtDetalhe(idEmp: string, forms) {
    return this.http.post(this.url + idEmp, forms);
  }
}
