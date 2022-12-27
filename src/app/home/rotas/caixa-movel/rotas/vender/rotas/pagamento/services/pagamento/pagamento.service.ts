/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
  private url = 'http://192.168.0.15:8080/app/caixaMovel/venda/pagamento/formas?id=';

  constructor(private http: HttpClient) { }

  all(idEmp: string) {
    return this.http.get(this.url + idEmp);
  }

  pgmtDetalhe(idEmp: string, forms) {
    return this.http.post(this.url + idEmp, forms);
  }
}
