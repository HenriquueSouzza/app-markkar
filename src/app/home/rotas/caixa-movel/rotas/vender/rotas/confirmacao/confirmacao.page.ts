/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Storage } from '@ionic/storage-angular';
import { VendaService } from '../../services/venda/venda.service';
import { ConfirmacaoService } from './services/confirmacao/confirmacao.service';

@Component({
  selector: 'app-confirmacao',
  templateUrl: './confirmacao.page.html',
  styleUrls: ['./confirmacao.page.scss'],
})
export class ConfirmacaoPage implements OnInit {

  @ViewChild('selectCaixa') selectCaixa: any;

  public produtos: Array<object>;
  public pagamentos: Array<object>;
  public totalCarrinho: string;
  public clienteNome: string;
  public clienteCPF: string;
  public caixasAbertos: Array<object>;
  public caixaSelecionado: string;
  private caixaMovelStorage: any;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private vendaService: VendaService,
    private confirmacaoService: ConfirmacaoService,
    private storage: Storage,
    private navCtrl: NavController,
    private storageService: StorageService) { }

  ngOnInit() { }

  async ionViewWillEnter(){
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    if (this.caixaMovelStorage.sistemaVendas.vendaAtual === null) {
      this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas');
    }
    this.produtos = this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList;
    this.pagamentos = this.caixaMovelStorage.sistemaVendas.vendaAtual.pagList;
    this.clienteNome = this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.nome === null ?
      'Não informado.' : this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.nome.toLowerCase();
    this.clienteCPF = this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.cpf === null ?
      'Não informado.': this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.cpf;
    this.caixaSelecionado = this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.caixaId;
    this.totalCar();
    this.vendaService.buscarCaixasAbertos(this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.vendaId).subscribe((res: any)=>{
      this.caixasAbertos = res.caixasAbertos;
      this.selectCaixa.value = this.caixaSelecionado;
    }, (error) => {
      console.log(error);
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

  convertReal(valor){
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  async finalizarVenda(){
    const loading = await this.loadingController.create({
      message: 'Finalizando a venda, Aguarde...'
    });
    await loading.present();
    this.confirmacaoService.finalizar(this.caixaMovelStorage.sistemaVendas.vendaAtual).subscribe(async (res: any) => {
      console.log(res.status.venda['STATUS']);
      if(res.status.venda['STATUS'] === 'OK') {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Venda finalizada',
          backdropDismiss: false,
          buttons: [
            {
              text: 'Fechar',
              id: 'confirm-button'
            },
          ],
        });
        await alert.present();
        this.caixaMovelStorage.sistemaVendas.vendaAtual = null;
        await this.storage.set('caixa-movel', this.caixaMovelStorage);
        this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas');
      } else {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Ocorreu um erro ao finalizar:',
          message: res.status.venda['STATUS'].toLowerCase()+'.',
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
      await loading.dismiss();
    });
  }
}
