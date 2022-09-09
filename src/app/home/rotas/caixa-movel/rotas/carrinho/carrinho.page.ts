/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.scss'],
})
export class CarrinhoPage implements OnInit {

  public produtos: Array<object>;
  public totalCarrinho: string;
  private caixaMovelStorage: any;

  constructor(
    private storage: Storage,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.produtos = this.caixaMovelStorage.vendas.carrinho;
    this.totalCar();
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
      qnt++;
    } else if (exc === 'sub') {
      qnt--;
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

  totalCar(){
    const valores = [];
    for (const produto of this.produtos) {
      valores.push(produto['valor']*produto['qnt']);
      this.totalCarrinho = this.convertReal(valores.reduce((a, b) => a + b, 0));
    }
  }

  remove(prodEvent){
    console.log(prodEvent);
    let i = -1;
    for (const produto of this.produtos) {
      i++;
      if(produto['id'] === prodEvent['id']){
        console.log(i);
        this.produtos.splice(i,i);
      }
    }
  }
}