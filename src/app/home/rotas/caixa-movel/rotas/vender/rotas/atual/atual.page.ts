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
    const loading = await this.loadingController.create({
      message: 'Finalizando a venda, Aguarde...',
    });
    await loading.present();
    if (
      this.caixaMovelStorage.sistemaVendas.vendaAtual.pagList.length === 0 ||
      this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList.length === 0
    ) {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Ocorreu um erro ao finalizar:',
        message:
          'Por Favor, verifique se todos os campos foram preenchidos e tente novamente.',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Fechar',
            id: 'confirm-button',
          },
        ],
      });
      await alert.present();
      await loading.dismiss();
    } else {
      this.vendaService
        .gravarBd(this.caixaMovelStorage.sistemaVendas.vendaAtual)
        .subscribe(
          async (res: any) => {
            console.log(res);
            if (res.status.fireBird['STATUS'] === 'OK') {
              this.vendaService
                .finalizar(this.caixaMovelStorage.sistemaVendas.vendaAtual)
                .subscribe(
                  async (resFin: any) => {
                    if (resFin.status === 1) {
                      const alert = await this.alertController.create({
                        cssClass: 'my-custom-class',
                        header: 'Venda finalizada',
                        backdropDismiss: false,
                        buttons: [
                          {
                            text: 'Fechar',
                            id: 'confirm-button',
                          },
                        ],
                      });
                      await alert.present();
                      await loading.dismiss();
                      this.caixaMovelStorage.sistemaVendas.vendaAtual = null;
                      await this.storage.set('caixa-movel', this.caixaMovelStorage);
                      this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas');
                    } else {
                      const alert = await this.alertController.create({
                        cssClass: 'my-custom-class',
                        header: 'Ocorreu um erro ao finalizar:',
                        message: 'Por favor, verifique o servidor.',
                        backdropDismiss: false,
                        buttons: [
                          {
                            text: 'Fechar',
                            id: 'confirm-button',
                          },
                        ],
                      });
                      await alert.present();
                      await loading.dismiss();
                    }
                  },
                  async (err) => {
                    const alert = await this.alertController.create({
                      cssClass: 'my-custom-class',
                      header: 'Ocorreu um erro ao finalizar:',
                      message: 'Erro ao tentar comunicar com o servidor',
                      backdropDismiss: false,
                      buttons: [
                        {
                          text: 'Fechar',
                          id: 'confirm-button',
                        },
                      ],
                    });
                    await alert.present();
                    await loading.dismiss();
                  }
                );
            } else {
              const alert = await this.alertController.create({
                cssClass: 'my-custom-class',
                header: 'Ocorreu um erro ao finalizar:',
                message:
                  res.status.fireBird['STATUS'] !== 'OK'
                    ? res.status.fireBird['STATUS'].toLowerCase() + '.'
                    : 'Por favor, verifique o servidor.',
                backdropDismiss: false,
                buttons: [
                  {
                    text: 'Fechar',
                    id: 'confirm-button',
                  },
                ],
              });
              await alert.present();
              await loading.dismiss();
            }
          },
          async (err) => {
            const alert = await this.alertController.create({
              cssClass: 'my-custom-class',
              header: 'Ocorreu um erro ao finalizar:',
              message: 'Erro ao tentar comunicar com o servidor',
              backdropDismiss: false,
              buttons: [
                {
                  text: 'Fechar',
                  id: 'confirm-button',
                },
              ],
            });
            await alert.present();
            await loading.dismiss();
          }
        );
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
                    this.erroAlert(
                      'Erro ao cancelar a venda:',
                      res.status.toLowerCase()
                    );
                  }
                },
                (err) => {
                  this.erroAlert(
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
  async erroAlert(title, men) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: title,
      message: men,
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
