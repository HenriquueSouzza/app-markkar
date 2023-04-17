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
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

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
    private storageService: StorageService,
    private androidPermissions: AndroidPermissions
  ) {}

  ngOnInit() { }

  async ionViewWillEnter() {
    const loading = await this.createLoading('Aguarde...');
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
      this.vendaService
      .buscarCaixasAbertos(
        this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.vendaId,
        this.caixaMovelStorage.configuracoes.slectedIds.ipLocal
      )
      .subscribe({
        next: async (res: any) => {
          await loading.dismiss();
          this.caixasAbertos = res.caixasAbertos;
          this.selectCaixa.value = this.caixaSelecionado;
          this.verificaValorPago();
        },
        error: async (err) => {
          this.limpaVendaStorage();
          await this.exibirAlerta('Erro ao tentar comunicar com o servidor local.');
          await loading.dismiss();
        }
      }
    );
  }

  checkCamPermit(){
    this.androidPermissions
      .checkPermission(this.androidPermissions.PERMISSION.CAMERA)
      .then(
        async (result: any) => {
          if (!result.hasPermission) {
            this.androidPermissions.requestPermission(
              this.androidPermissions.PERMISSION.CAMERA
            );
          }
        },
        (err) =>
          this.androidPermissions.requestPermission(
            this.androidPermissions.PERMISSION.CAMERA
          )
      );
  }

  convertReal(valor) {
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  verificaValorPago() {
    const valoresPagos =
      this.caixaMovelStorage.sistemaVendas.vendaAtual.pagList.map(
        (pagamento) => pagamento.valor
      );
    const valoresProdutos =
    this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList.map(
      (produtos) => produtos.valor
    );
    const pagamentoTotal = valoresPagos.reduce((a, b) => a + b, 0);
    const totalProdutos = valoresProdutos.reduce((a, b) => a + b, 0);
    if(pagamentoTotal < totalProdutos){
      console.log('valor menor');
      return false;
    } else if(pagamentoTotal !== totalProdutos){
      console.log('valor diferente');
      return false;
    }
    else if(pagamentoTotal === totalProdutos){
      console.log('ok');
      return true;
    }else {
      console.log('valor diferente');
      return false;
    }
  }

  async finalizarVenda() {
    const loading = await this.createLoading('Finalizando a venda, Aguarde...');
    try {
      const vendaAtual = this.caixaMovelStorage.sistemaVendas.vendaAtual;
      if (
        vendaAtual.pagList.length === 0 ||
        vendaAtual.produtosList.length === 0
      ) {
        await this.exibirAlerta(
          'Erro ao tentar finalizar a venda.',
          'Por Favor, verifique se todos os campos foram preenchidos e tente novamente.'
        );
        await loading.dismiss();
      } else {
        this.vendaService.gravarBd(vendaAtual, this.caixaMovelStorage.configuracoes.slectedIds.ipLocal).subscribe({
          next: async (gravarBdResponse: any) => {
            const firebirdStatus = gravarBdResponse?.status?.fireBird?.STATUS;
            if (firebirdStatus !== 'OK') {
              await loading.dismiss();
              this.limpaVendaStorage();
              await this.exibirAlerta(
                'Erro ao tentar finalizar a venda.',
                firebirdStatus?.toLowerCase() ||
                  'Por favor, verifique o servidor.'
              );
            } else {
              this.vendaService.finalizar(vendaAtual, this.caixaMovelStorage.configuracoes.slectedIds.ipLocal).subscribe({
                next: async (finalizarResponse: any) => {
                  await loading.dismiss();
                  if (finalizarResponse?.status === 1) {
                    await this.exibirAlerta('Venda finalizada', null);
                    this.limpaVendaStorage();
                  } else {
                    this.limpaVendaStorage();
                    await this.exibirAlerta(
                      'Erro ao tentar finalizar a venda.',
                      'Por favor, verifique o servidor.'
                    );
                  }
                },
                error: async (error) => {
                  await loading.dismiss();
                  await this.exibirAlerta(
                    'Erro ao connectar ao servidor.',
                    'Por favor, tente novamente.'
                  );
                },
              });
            }
          },
          error: async (error) => {
            await loading.dismiss();
            await this.exibirAlerta(
              'Erro ao connectar ao servidor.',
              'Por favor, tente novamente.'
            );
          },
        });
      }
    } catch (error) {
      await this.exibirAlerta(
        'Erro ao finalizar a venda.',
        'Por favor, tente novamente.'
      );
    }
  }

  async cancelarVenda() {
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
                  .vendaId,
                  this.caixaMovelStorage.configuracoes.slectedIds.ipLocal
              )
              .subscribe(
                async (res: any) => {
                  await loading.dismiss();
                  if (
                    res.status === 'OK' ||
                    res.status.toLowerCase() === 'a venda já foi cancelada'
                  ) {
                    this.limpaVendaStorage();
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

  async limpaVendaStorage() {
    this.caixaMovelStorage.sistemaVendas.vendaAtual = null;
    await this.storage.set('caixa-movel', this.caixaMovelStorage);
    this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas');
  }

  // erros
  async createLoading(message) {
    const loading = await this.loadingController.create({ message });
    await loading.present();
    return loading;
  }

  async exibirAlerta(header, message='') {
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
