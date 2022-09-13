/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
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
    public alertController: AlertController,
    private navCtrl: NavController,
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
      this.setCarrinhoStorage();
      return 1;
    } else {
      this.setCarrinhoStorage();
      return qnt;
    }
  }

  verificaEstoque(qnt, qntEstoque){
    if(qnt > qntEstoque){
      return qntEstoque;
    } else {
      return qnt;
    }
  }

  async setCarrinhoStorage(){
    this.caixaMovelStorage.vendas.carrinho = this.produtos;
    await this.storage.set('caixa-movel', this.caixaMovelStorage);
  }

  convertReal(valor){
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  totalCar(){
    const valores = [];
    if(this.produtos.length === 0){
      this.totalCarrinho = this.convertReal(0);
    } else {
      for (const produto of this.produtos) {
        valores.push(produto['valor']*produto['qnt']);
        this.totalCarrinho = this.convertReal(valores.reduce((a, b) => a + b, 0));
      }
    }
  }

  async remove(prodEvent){
    let i = -1;
    for (const produto of this.produtos) {
      i++;
      if(produto['id'] === prodEvent['id']){
        this.produtos.splice(i);
        this.totalCar();
        this.caixaMovelStorage.vendas.carrinho = this.produtos;
        await this.storage.set('caixa-movel', this.caixaMovelStorage);
      }
    }
  }

  async cancelarCarrinho(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Você deseja cancelar a venda?',
      message: 'Ao cancelar todo carrinho será deletado.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'NÃO',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button'
        },
        {
          text: 'SIM',
          id: 'confirm-button',
          handler: async () => {
            this.produtos = [];
            this.totalCar();
            this.caixaMovelStorage.vendas.carrinho = this.produtos;
            await this.storage.set('caixa-movel', this.caixaMovelStorage);
            this.navCtrl.navigateBack('/home/caixa-movel');
          },
        },
      ],
    });
    await alert.present();
  }
}
