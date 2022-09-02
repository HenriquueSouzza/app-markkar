import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.scss'],
})
export class CarrinhoPage implements OnInit {

  public produtos: Array<object>;

  constructor() { }

  ngOnInit() {
    this.produtos = [{nome: 'teste', id: 1, cod: 2123, qnt: 5, valor: 18}, {nome: 'teste2', id: 5, cod: 2323, qnt: 3, valor: 52}];
  }

  toIntQnt(qnt){
    if(qnt < 1 || qnt === ''){
      return 1;
    }else {
      return parseInt(qnt, 10);
    }
  }

  changeQnt(qnt, exc){
    if (exc === 'add') {
      qnt = qnt + 1;
    } else if (exc === 'sub') {
      qnt = qnt - 1;
    }
    if(qnt < 1 || qnt === ''){
      return 1;
    } else {
      return qnt;
    }
  }

  convertReal(valor){
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
