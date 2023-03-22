/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Storage } from '@ionic/storage-angular';
import { VendaService } from './services/venda/venda.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-atual',
  templateUrl: './atual.page.html',
  styleUrls: ['./atual.page.scss'],
})
export class AtualPage implements OnInit {
  @ViewChild('selectCaixa') selectCaixa: any;

  public produtos: Array<object>;
  public produtosLength: number;
  public pagamentos: Array<object>;
  public pagamentosLength: number;
  public totalCarrinho: string;
  public clienteNome: string;
  public clienteCPF: string;
  public caixasAbertos: Array<object>;
  public caixaSelecionado: string;
  public codVenda: string;
  private caixaMovelStorage: any;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private vendaService: VendaService,
    private storage: Storage,
    private navCtrl: NavController,
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    if (this.caixaMovelStorage.sistemaVendas.vendaAtual === null) {
      this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas');
    }
    this.produtos =
      this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList;
    this.produtosLength = this.produtos.length;
    this.pagamentos = this.caixaMovelStorage.sistemaVendas.vendaAtual.pagList;
    this.pagamentosLength = this.pagamentos.length;
    this.clienteNome =
      this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.nome === null
        ? 'Não informado.'
        : this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.nome.toLowerCase();
    this.clienteCPF =
      this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.cpf === null
        ? 'Não informado.'
        : this.caixaMovelStorage.sistemaVendas.vendaAtual.clienteInfo.cpf;
    this.caixaSelecionado =
      this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.caixaId;
    this.codVenda =
      this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.vendaId;
    this.totalCar();
    this.vendaService
      .buscarCaixasAbertos(
        this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.vendaId
      )
      .subscribe(
        (res: any) => {
          console.log(res);
          this.caixasAbertos = res.caixasAbertos;
          this.selectCaixa.value = this.caixaSelecionado;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  totalCar() {
    const valores = [];
    if (this.produtos.length === 0) {
      this.totalCarrinho = this.convertReal(0);
    } else {
      for (const produto of this.produtos) {
        valores.push(produto['valor'] * produto['qnt']);
        this.totalCarrinho = this.convertReal(
          valores.reduce((a, b) => a + b, 0)
        );
      }
    }
  }

  convertReal(valor) {
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  async finalizarVenda() {
    const loading = await this.createLoading('Finalizando a venda, Aguarde...');
    try {
      const vendaAtual = this.caixaMovelStorage.sistemaVendas.vendaAtual;
      if (vendaAtual.pagList.length === 0 || vendaAtual.produtosList.length === 0) {
        await this.exibirAlerta('Erro ao tentar finalizar a venda.', 'Por Favor, verifique se todos os campos foram preenchidos e tente novamente.');
      } else {
        const gravarBdResponse: any = await firstValueFrom(this.vendaService.gravarBd(vendaAtual));
        const firebirdStatus = gravarBdResponse?.status?.fireBird?.STATUS;
        if (firebirdStatus !== 'OK') {
          await this.exibirAlerta('Erro ao tentar finalizar a venda.', firebirdStatus?.toLowerCase() || 'Por favor, verifique o servidor.');
        } else {
          const finalizarResponse: any = await firstValueFrom(this.vendaService.finalizar(vendaAtual));
          if (finalizarResponse?.status === 1) {
            await this.exibirAlerta('Venda finalizada', null);
            this.caixaMovelStorage.sistemaVendas.vendaAtual = null;
            await this.storage.set('caixa-movel', this.caixaMovelStorage);
            this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas');
          } else {
            await this.exibirAlerta('Erro ao tentar finalizar a venda.', 'Por favor, verifique o servidor.');
          }
        }
      }
    } catch (error) {
      await this.exibirAlerta('Erro ao finalizar a venda.', 'Por favor, tente novamente.');
    } finally {
      await loading.dismiss();
    }
  }

  async cancelarCarrinho() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Você deseja cancelar a venda?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'NÃO',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
        },
        {
          text: 'SIM',
          id: 'confirm-button',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cancelando venda, aguarde...',
            });
            await loading.present();
            this.vendaService
              .cancelar(
                this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds
                  .vendaId
              )
              .subscribe(
                async (res: any) => {
                  await loading.dismiss();
                  if (
                    res.status === 'OK' ||
                    res.status.toLowerCase() === 'a venda já foi cancelada'
                  ) {
                    this.caixaMovelStorage.sistemaVendas.vendaAtual = null;
                    await this.storage.set(
                      'caixa-movel',
                      this.caixaMovelStorage
                    );
                    this.navCtrl.navigateBack(
                      '/home/caixa-movel/sistema-vendas'
                    );
                  } else {
                    this.exibirAlerta(
                      'Erro ao cancelar a venda:',
                      res.status.toLowerCase()
                    );
                  }
                },
                (err) => {
                  this.exibirAlerta(
                    'Erro ao cancelar a venda:',
                    'Erro ao conectar com o servidor local'
                  );
                }
              );
          },
        },
      ],
    });
    await alert.present();
  }

  // erros
  async createLoading(message) {
    const loading = await this.loadingController.create({ message });
    await loading.present();
    return loading;
  }

  async exibirAlerta(header, message) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header,
      message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Fechar',
          id: 'confirm-button',
        },
      ],
    });
    await alert.present();
  }
}
