/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
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
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {}


  async ngOnInit() {
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
    this.modoRapido = false;
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
      this.mostrarModalProdutoScaneado(codeBar);
    }, 500);*/
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
      this.mostrarModalProdutoScaneado(codeBar);
    }
  }

  stopScan() {
    this.scanIsRun = false;
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  }

  reloadScan() {
    this.startScan();
    setTimeout(() => {
      if (this.scanIsRun === true) {
        this.stopScan();
        this.presentToast('Não foi possível ler o código...');
      }
    }, 15000);
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

  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark',
    });
    toast.present();
  }

  consultarProd(form: NgForm){
    this.inputCodeScanner['value'] = '';
    this.mostrarModalProdutoScaneado(form.value.codeProd);
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
          this.caixaMovelStorage.vendas.carrinho[i].qnt = this.pordutoScanneado.qnt;
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
    for (const produto of this.caixaMovelStorage.vendas.carrinho) {
      valores.push(produto['valor']*produto['qnt']);
      this.totalCarrinho = this.convertReal(valores.reduce((a, b) => a + b, 0));
    }
  }

  goToCar(){
    this.navCtrl.navigateForward('/home/caixa-movel/carrinho', {
      queryParams: { id1: this.idEmpBird, id2: this.idCc}
    });
  }

  /*

  #
  # Modal
  #

  */

  mostrarModalProdutoScaneado(codeBar){
    this.modalProdIsOpen = true;
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
    }
      //{nome: 'teste', id: 1, cod: 2123, qnt: 5, valor: 18}
      //{COD_BARRA: "7899838806976" COD_PRODUTO: "4371" NOME_PRODUTO: "TESTE HENRIQUE" QTD_ESTOQUE: "50" UNIDADE: "UN" VALOR: "5"}
    );
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