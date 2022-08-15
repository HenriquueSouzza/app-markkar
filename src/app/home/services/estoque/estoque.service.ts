import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface interfaceEstoque {
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {

  private url = 'http://192.168.1.12/tt';

  constructor(private http: HttpClient) { }

  estoque(intEst: interfaceEstoque) {
    return this.http.post(this.url, intEst);
  }
}
