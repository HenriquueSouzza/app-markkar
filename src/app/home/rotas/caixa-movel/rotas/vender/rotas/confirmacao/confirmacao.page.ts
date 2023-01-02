/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Storage } from '@ionic/storage-angular';
import { VendaService } from '../../services/venda/venda.service';
import { CaixaService } from './services/caixa/caixa.service';

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
    private storage: Storage,
    private navCtrl: NavController,
    private storageService: StorageService,
    private caixaService: CaixaService) { }

  async ngOnInit() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    if (this.caixaMovelStorage.sistemaVendas.vendaAtual === null) {
      this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas');
    }
    this.produtos = this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList;
    this.pagamentos = this.caixaMovelStorage.sistemaVendas.vendaAtual.pagList;
    this.clienteNome = this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.nome.toLowerCase();
    this.clienteCPF = this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.cpf;
    this.caixaSelecionado = this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.caixaId;
    this.totalCar();
    this.caixaService.buscar(this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.vendaId).subscribe((res: any)=>{
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
}
