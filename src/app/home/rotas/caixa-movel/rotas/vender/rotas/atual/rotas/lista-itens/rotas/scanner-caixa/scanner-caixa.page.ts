/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { VendaService } from '../../../../services/venda/venda.service';
import { EstoqueService } from 'src/app/home/rotas/caixa-movel/rotas/estoque/services/estoque/estoque.service';

@Component({
  selector: 'app-scanner-caixa',
  templateUrl: './scanner-caixa.page.html',
  styleUrls: ['./scanner-caixa.page.scss'],
})
export class ScannerCaixaPage implements OnInit {
  @ViewChild('inputCodeScanner') inputCodeScanner!: ElementRef;

  public modoRapido: boolean;
  public pordutoScanneado: any;
  public flashIsSwitchedOn = false;
  public telaEspelho = true;
  public telaDigCodigo = false;
  public modalProdIsOpen = false;
  public totalCarrinho: string;
  private caixaMovelStorage: any;
  private scanIsRun = false;
  private idCc: string;
  private idEmpBird: any;

  constructor(
    public toastController: ToastController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    private storage: Storage,
    private vendaService: VendaService,
    private storageService: StorageService,
    private screenOrientation: ScreenOrientation,
    private estoqueService: EstoqueService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
  }

  async ionViewWillEnter(){
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    if (this.caixaMovelStorage.sistemaVendas.vendaAtual === null) {
      this.navigateBack();
    }
    this.pordutoScanneado = {
      nome: null,
      id: null,
      cod: null,
      qnt: null,
      qntMax: null,
      medida: null,
      valor: null
    };
    this.somaTotalCarrinho();
    this.modoRapido = this.caixaMovelStorage.sistemaVendas.configuracoes.modoRapido;
    this.idEmpBird = this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.fireBirdIdEmp;
    this.idCc = this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.fireBirdIdCc;
    setTimeout(() => {
      this.telaEspelho = false;
    }, 700);
    this.reloadScan();
    /*setTimeout(() => {
      const codeBar = '000000000011';
      this.mostrarProdutoScaneado(codeBar);
    }, 500);*/
  }

  ionViewWillLeave() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.telaEspelho = true;
    this.stopScan();
  }

  async setCaixaMovel(){
    await this.storage.set('caixa-movel', this.caixaMovelStorage);
  }

  /*

  #
  # Scanner
  #

  */

  async startScan() {
    this.scanIsRun = true;
    this.screenOrientation.unlock();
    BarcodeScanner.hideBackground(); // make background of WebView transparent
    const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
    // if the result has content
    if (result.hasContent) {
      const codeBar: string = result.content; //result.content log the raw scanned content
      this.mostrarProdutoScaneado(codeBar);
      if(this.modoRapido){
        this.reloadScan();
      }
    }
  }

  stopScan() {
    this.scanIsRun = false;
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  }

  reloadScan() {
    this.startScan();
  }

  switchFlashLight() {
    //this.flashlight.toggle();
    //this.flashIsSwitchedOn = this.flashlight.isSwitchedOn();
  }

  navigateBack() {
    this.stopScan();
    this.telaEspelho = true;
    setTimeout(() => {
      this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas/atual/lista-itens');
    }, 500);
  }

  async presentToast(message, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message,
      position,
      duration: 3000,
      color: 'dark',
      buttons: [
        {
          text: 'Fechar',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  consultarProd(form: NgForm){
    if(form.value.codeProd !== ''){
      this.mostrarProdutoScaneado(form.value.codeProd);
    }
  }

  setModoRapido(){
    this.modoRapido = !this.modoRapido;
    this.caixaMovelStorage.sistemaVendas.configuracoes.modoRapido = this.modoRapido;
    this.setCaixaMovel();
  }

  /*

  #
  # carrinho
  #

  */

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
    this.somaTotalCarrinho();
  }

  somaTotalCarrinho(){
    const valores = [];
    if(this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList.length === 0){
      this.totalCarrinho = this.convertReal(0);
    } else {
      for (const produto of this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList) {
        valores.push(produto['valor']*produto['qnt']);
        this.totalCarrinho = this.convertReal(valores.reduce((a, b) => a + b, 0));
      }
    }
  }

  mostrarProdutoScaneado(codeBar){
    this.estoqueService.consultaProduto({
      codeEmp: this.idEmpBird,
      codeCC: this.idCc,
      codeBar,
      nome: ''
    }).subscribe(async (res: any) => {
      const produtos = Object.values(res.produtos);
      if(produtos.length !== 0){
        if(this.telaDigCodigo){
          this.inputCodeScanner['value'] = '';
        }
        this.pordutoScanneado = {
          nome: produtos[0]['NOME_PRODUTO'],
          id: produtos[0]['COD_PRODUTO'],
          cod: produtos[0]['COD_BARRA'],
          qnt: produtos[0]['QTD_ESTOQUE'] === '0' ? 0 : 1,
          qntMax: produtos[0]['QTD_ESTOQUE'],
          medida: produtos[0]['UNIDADE'],
          valor: produtos[0]['VALOR']
        };
        if(this.modoRapido){
          // eslint-disable-next-line max-len
          this.presentToast(`PRODUTO ADICIONADO:<br><br>produto: ${this.pordutoScanneado.nome} <br>Cod: ${this.pordutoScanneado.cod}<br>QntMax: ${this.pordutoScanneado.qntMax}<br>Medida: ${this.pordutoScanneado.medida}<br><br>VALOR: ${this.convertReal(this.pordutoScanneado.valor)}`, 'middle');
          this.adicionaCarrinho();
        } else {
          this.modalProdIsOpen = true;
        }
      } else {
        this.presentToast('Nenhum produto encontrado', 'bottom');
      }
    }
    );
  }

  /*

  #
  # Modal
  #

  */



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
      return 1;
    } else {
      return qnt;
    }
  }

  convertReal(valor){
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  verificaEstoque(qnt, qntEstoque){
    if(qnt > qntEstoque){
      return qntEstoque;
    } else {
      return qnt;
    }
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
