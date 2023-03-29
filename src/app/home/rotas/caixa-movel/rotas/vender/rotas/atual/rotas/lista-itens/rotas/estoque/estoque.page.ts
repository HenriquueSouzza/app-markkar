/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { NavController, ToastController } from '@ionic/angular';
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

  // storage
  private caixaMovelStorage: any;

  constructor(
    private storage: Storage,
    private storageService: StorageService,
    private navCtrl: NavController,
    private estoqueService: EstoqueService,
    public toastController: ToastController
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.idEmpBird =
      this.caixaMovelStorage.configuracoes.slectedIds.firebirdIdEmp;
    this.idCc = this.caixaMovelStorage.configuracoes.slectedIds.fireBirdIdCc;
    this.updateListEstoque();
  }

  navigateScanner() {
    this.navCtrl.navigateForward(
      '/home/caixa-movel/sistema-vendas/atual/lista-itens/scanner'
    );
  }

  updateListEstoque(nome = '', codeBar = '') {
    this.estoqueService
      .consultaProduto({
        codeEmp: this.idEmpBird,
        codeCC: this.idCc,
        codeBar,
        nome,
      })
      .subscribe({
        next: (response: any) => {
          this.listEstoque = response.produtos;
        },
        error: (err) => {
          console.log(err);
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
      .consultaProduto({
        codeEmp: this.idEmpBird,
        codeCC: this.idCc,
        codeBar,
        nome,
      })
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
          this.modalProdIsOpen = true;
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
    if (qnt > qntEstoque) {
      return qntEstoque;
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

  redirectHist(code) {
    this.navCtrl.navigateForward('/home/caixa-movel/estoque/produtos', {
      queryParams: { id1: this.idEmpBird, id2: this.idCc, code, nome: '' },
    });
  }

  /* Erros */

  async presentToast(message, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message,
      position,
      duration: 3000,
      color: 'dark',
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
