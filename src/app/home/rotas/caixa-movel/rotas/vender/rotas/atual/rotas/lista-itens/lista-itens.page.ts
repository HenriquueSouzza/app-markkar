/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { VendaService } from '../../services/venda/venda.service';


@Component({
  selector: 'app-lista-itens',
  templateUrl: './lista-itens.page.html',
  styleUrls: ['./lista-itens.page.scss'],
})
export class ListaItensPage implements OnInit {
  public produtos: Array<object>;
  public totalCarrinho: string;
  private caixaMovelStorage: any;
  private qntMaxBlock: any;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private vendaService: VendaService,
    private storage: Storage,
    private navCtrl: NavController,
    private storageService: StorageService
  ) { }

  ngOnInit() { }

  async ionViewWillEnter() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    if (this.caixaMovelStorage.sistemaVendas.vendaAtual === null) {
      this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas');
    }
    this.produtos = this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList;
    this.qntMaxBlock =
      this.caixaMovelStorage.sistemaVendas.configuracoes.qntMaxBlock;
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
    if(qnt > qntEstoque && this.qntMaxBlock === true){
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
    const index = this.produtos.findIndex((produto: any) => produto.id === prodEvent.id);
    if(index !== -1){
      this.produtos.splice(index, 1);
      this.totalCar();
      this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList = this.produtos;
      await this.storage.set('caixa-movel', this.caixaMovelStorage);
    }
  }

  voltarAtual(){
    this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas/atual');
  }

  goAdd(){
    this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/atual/lista-itens/estoque');
  }

  goPagamentos(){
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
