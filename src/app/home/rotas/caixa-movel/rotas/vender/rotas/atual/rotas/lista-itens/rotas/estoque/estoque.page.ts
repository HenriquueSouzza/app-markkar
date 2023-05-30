/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import {
  AlertController,
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { EstoqueService } from 'src/app/home/rotas/caixa-movel/rotas/estoque/services/estoque/estoque.service';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.scss'],
})
export class EstoquePage implements OnInit {
  public centroscustos: Array<any>;
  public consultaNome = false;
  public estoqueStorageHist: any;
  public idEmpBird: any;
  public idCc: string;
  public recentesExist = false;
  public modalProdIsOpen = false;
  public listEstoque: any;
  public pordutoScanneado: any;
  private estoqueStorage: any;
  private modoRapido: any;
  private qntMaxBlock: any;

  // storage
  private caixaMovelStorage: any;

  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController,
    public toastController: ToastController,
    private storage: Storage,
    private storageService: StorageService,
    private navCtrl: NavController,
    private estoqueService: EstoqueService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.idEmpBird =
      this.caixaMovelStorage.configuracoes.slectedIds.firebirdIdEmp;
    this.idCc = this.caixaMovelStorage.configuracoes.slectedIds.fireBirdIdCc;
    this.modoRapido =
      this.caixaMovelStorage.sistemaVendas.configuracoes.modoRapido;
    this.qntMaxBlock =
      this.caixaMovelStorage.sistemaVendas.configuracoes.qntMaxBlock;
    this.updateListEstoque();
  }

  navigateScanner() {
    this.navCtrl.navigateForward(
      '/home/caixa-movel/sistema-vendas/atual/lista-itens/scanner'
    );
  }

  updateListEstoque(nome = '', codeBar = '') {
    this.estoqueService
      .consultaProduto(
        {
          codeEmp: this.idEmpBird,
          codeCC: this.idCc,
          codeBar,
          nome,
        },
        this.caixaMovelStorage.configuracoes.slectedIds.ipLocal
      )
      .subscribe({
        next: (response: any) => {
          this.listEstoque = response.produtos;
        },
        error: async (err) => {
          console.log(err);
          //this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas/atual');
          await this.exibirAlerta(
            'Erro ao tentar comunicar com o servidor local.'
          );
        },
      });
  }

  async consultarNomeOuCod(form: NgForm) {
    const strConsulta = form.value.nomeProd;
    if (/^\d+$/.test(strConsulta) && strConsulta.length === 12) {
      this.updateListEstoque('', strConsulta);
    } else {
      this.updateListEstoque(strConsulta);
    }
  }

  mostrarProdutoScaneado(nome = '', codeBar = '') {
    this.estoqueService
      .consultaProduto(
        {
          codeEmp: this.idEmpBird,
          codeCC: this.idCc,
          codeBar,
          nome,
        },
        this.caixaMovelStorage.configuracoes.slectedIds.ipLocal
      )
      .subscribe(async (res: any) => {
        const produtos = Object.values(res.produtos);
        if (produtos.length !== 0) {
          this.pordutoScanneado = {
            nome: produtos[0]['NOME_PRODUTO'],
            id: produtos[0]['COD_PRODUTO'],
            cod: produtos[0]['COD_BARRA'],
            qnt: produtos[0]['QTD_ESTOQUE'] === '0' ? 0 : 1,
            qntMax: produtos[0]['QTD_ESTOQUE'],
            medida: produtos[0]['UNIDADE'],
            valor: produtos[0]['VALOR'],
          };
          if (this.modoRapido) {
            // eslint-disable-next-line max-len
            this.presentToast(
              `PRODUTO ADICIONADO:<br><br>produto: ${
                this.pordutoScanneado.nome
              } <br>Cod: ${this.pordutoScanneado.cod}<br>QntMax: ${
                this.pordutoScanneado.qntMax
              }<br>Medida: ${
                this.pordutoScanneado.medida
              }<br><br>VALOR: ${this.convertReal(
                this.pordutoScanneado.valor
              )}`,
              'middle'
            );
            this.adicionaCarrinho();
          } else {
            this.modalProdIsOpen = true;
          }
        } else {
          this.presentToast('Nenhum produto encontrado', 'bottom');
        }
      });
  }

  async adicionaCarrinho() {
    if (
      this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList.length > 0
    ) {
      // Método Array.findIndex() para encontrar o índice do produto
      const index =
        this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList.findIndex(
          (produto) => produto.id === this.pordutoScanneado.id
        );
      if (index !== -1) {
        // Atualiza a quantidade do produto existente
        this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList[
          index
        ].qnt = this.pordutoScanneado.qnt;
      } else {
        // Adiciona o novo produto à lista
        this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList.push(
          this.pordutoScanneado
        );
      }
    } else {
      // Adiciona o novo produto à lista vazia
      this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList.push(
        this.pordutoScanneado
      );
    }
    await this.storage.set('caixa-movel', this.caixaMovelStorage);
    this.navCtrl.navigateBack(
      '/home/caixa-movel/sistema-vendas/atual/lista-itens'
    );
  }

  toIntQnt(qnt) {
    if (qnt < 1 || qnt === '') {
      return 1;
    } else {
      return parseInt(qnt, 10);
    }
  }

  changeQnt(qnt, exc) {
    if (exc === 'add') {
      qnt++;
    } else if (exc === 'sub') {
      qnt--;
    }
    if (qnt < 1 || qnt === '') {
      return 1;
    } else {
      return qnt;
    }
  }

  convertReal(valor) {
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  verificaEstoque(qnt, qntEstoque) {
    if (qnt > qntEstoque && this.qntMaxBlock === true) {
      return qntEstoque < 0 ? 1 : qntEstoque;
    } else {
      return qnt;
    }
  }

  verificaSearchbar(event) {
    if (event.detail.value.length > 0) {
      this.consultaNome = true;
    } else {
      this.updateListEstoque();
      this.consultaNome = false;
    }
  }

  /* Erros */

  async createLoading(message) {
    const loading = await this.loadingController.create({ message });
    await loading.present();
    return loading;
  }

  async exibirAlerta(header, message = '') {
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

  async presentToast(message, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message,
      position,
      duration: 3000,
      color: 'success',
      buttons: [
        {
          text: 'Fechar',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }
}
