import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  private urlProdutos = 'http://192.168.1.30/app/estoque/produtos';
  private urlcentroscustos = 'http://192.168.1.30/app/estoque/centroscustos';

  constructor(private http: HttpClient) { }

  consultaProduto(intProd: InterfaceConsultaProduto) {
    return this.http.post(this.urlProdutos, intProd);
  }

  consultaCC(intCC: InterfaceConsultaCentrosCustos){
    return this.http.post(this.urlcentroscustos, intCC);
  }
}
