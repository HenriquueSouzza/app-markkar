/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {

  constructor(private http: HttpClient) { }

  all(idEmp: string, ipLocal) {
    return this.http.get(`http://${ipLocal}/app/caixaMovel/venda/pagamento/formas?id=` + idEmp);
  }

  pgmtDetalhe(idEmp: string, forms, ipLocal) {
    return this.http.post(`http://${ipLocal}/app/caixaMovel/venda/pagamento/formas?id=` + idEmp, forms);
  }
}
