/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { VendaService } from '../../services/venda/venda.service';

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
    public alertController: AlertController,
    public loadingController: LoadingController,
    private vendaService: VendaService,
    private storage: Storage,
    private navCtrl: NavController,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    if (this.caixaMovelStorage.sistemaVendas.vendaAtual === null) {
      this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas');
    }
    this.produtos = this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList;
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
    this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList = this.produtos;
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
        this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList = this.produtos;
        await this.storage.set('caixa-movel', this.caixaMovelStorage);
      }
    }
  }

  voltarAtual(){
    this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas/atual');
  }

  goPagamento(){
    this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/atual/pagamento');
  }

  // erros
  async erroAlert(title, men){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: title,
      message: men,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Fechar',
          id: 'confirm-button'
        },
      ],
    });
    await alert.present();
  }
}
