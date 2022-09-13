/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { EstoqueService } from '../../../estoque/services/estoque/estoque.service';

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
    private storage: Storage,
    private storageService: StorageService,
    private screenOrientation: ScreenOrientation,
    private estoqueService: EstoqueService,
    private flashlight: Flashlight,
    public alertController: AlertController,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
  }

  async ionViewWillEnter(){
    this.pordutoScanneado = {
      nome: null,
      id: null,
      cod: null,
      qnt: null,
      qntMax: null,
      medida: null,
      valor: null
    };
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.somaTotalCarrinho();
    this.modoRapido = this.caixaMovelStorage.vendas.configuracoes.modoRapido;
    this.route.queryParamMap.subscribe((params: any) => {
      if (params) {
        this.idEmpBird = params.params.id1;
        this.idCc = params.params.id2;
      }
    });
    setTimeout(() => {
      this.telaEspelho = false;
    }, 700);
    this.reloadScan();
    /*setTimeout(() => {
      const codeBar = '7899838806976';
      this.mostrarProdutoScaneado(codeBar);
    }, 500);*/
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

  ionViewWillLeave() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.telaEspelho = true;
  }

  switchFlashLight() {
    //this.flashlight.toggle();
    //this.flashIsSwitchedOn = this.flashlight.isSwitchedOn();
  }

  navigateBack() {
    this.stopScan();
    this.telaEspelho = true;
    setTimeout(() => {
      this.navCtrl.navigateBack('/home/caixa-movel');
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
    this.inputCodeScanner['value'] = '';
    this.mostrarProdutoScaneado(form.value.codeProd);
  }

  setModoRapido(){
    this.modoRapido = !this.modoRapido;
    this.caixaMovelStorage.vendas.configuracoes.modoRapido = this.modoRapido;
    this.setCaixaMovel();
  }

  /*

  #
  # carrinho
  #

  */

  adicionaCarrinho(){
    if(this.caixaMovelStorage.vendas.carrinho.length > 0){
      let i = -1;
      for(const produto of this.caixaMovelStorage.vendas.carrinho){
        i++;
        if(produto.id === this.pordutoScanneado.id){
          if(this.modoRapido){
            ++this.caixaMovelStorage.vendas.carrinho[i].qnt;
            if(this.caixaMovelStorage.vendas.carrinho[i].qnt > this.caixaMovelStorage.vendas.carrinho[i].qntMax){
              this.caixaMovelStorage.vendas.carrinho[i].qnt = this.caixaMovelStorage.vendas.carrinho[i].qntMax;
            }
          } else {
            this.caixaMovelStorage.vendas.carrinho[i].qnt = this.pordutoScanneado.qnt;
          }
        } else {
          this.caixaMovelStorage.vendas.carrinho.push(this.pordutoScanneado);
        }
      }
    } else {
      this.caixaMovelStorage.vendas.carrinho.push(this.pordutoScanneado);
    }
    this.storage.set('caixa-movel', this.caixaMovelStorage);
    this.somaTotalCarrinho();
  }

  somaTotalCarrinho(){
    const valores = [];
    if(this.caixaMovelStorage.vendas.carrinho.length === 0){
      this.totalCarrinho = this.convertReal(0);
    } else {
      for (const produto of this.caixaMovelStorage.vendas.carrinho) {
        valores.push(produto['valor']*produto['qnt']);
        this.totalCarrinho = this.convertReal(valores.reduce((a, b) => a + b, 0));
      }
    }
  }

  goToCar(){
    this.navCtrl.navigateForward('/home/caixa-movel/carrinho', {
      queryParams: { id1: this.idEmpBird, id2: this.idCc}
    });
  }

  async cancelarCarrinho(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Você deseja cancelar a venda?',
      message: 'Ao cancelar todo carrinho será deletado.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'NÃO',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button'
        },
        {
          text: 'SIM',
          id: 'confirm-button',
          handler: async () => {
            this.caixaMovelStorage.vendas.carrinho = [];
            this.somaTotalCarrinho();
            await this.storage.set('caixa-movel', this.caixaMovelStorage);
            this.navigateBack();
          },
        },
      ],
    });
    await alert.present();
  }

  mostrarProdutoScaneado(codeBar){
    this.estoqueService.consultaProduto({
      codeEmp: this.idEmpBird,
      codeCC: this.idCc,
      codeBar,
      nome: ''
    }).subscribe(async (res: any) => {
      const produtos = Object.values(res.produtos);
      this.pordutoScanneado = {
        nome: produtos[0]['NOME_PRODUTO'],
        id: produtos[0]['COD_PRODUTO'],
        cod: produtos[0]['COD_BARRA'],
        qnt: 1,
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
    }
    //{nome: 'teste', id: 1, cod: 2123, qnt: 5, valor: 18}
    //{COD_BARRA: "7899838806976" COD_PRODUTO: "4371" NOME_PRODUTO: "TESTE HENRIQUE" QTD_ESTOQUE: "50" UNIDADE: "UN" VALOR: "5"}
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
}
