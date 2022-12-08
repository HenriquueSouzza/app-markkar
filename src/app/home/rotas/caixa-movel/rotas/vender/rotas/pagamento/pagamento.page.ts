/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SwiperComponent } from 'swiper/angular';
import { Platform } from '@ionic/angular';
import { PagamentoService } from './services/pagamento/pagamento.service';

@Component({
  selector: 'app-pagamento',
  templateUrl: './pagamento.page.html',
  styleUrls: ['./pagamento.page.scss'],
})
export class PagamentoPage implements OnInit {

  @ViewChild('swiper') swiper: SwiperComponent;
  @ViewChild('modal') modal: any;
  @ViewChild(IonContent) content: IonContent;

  public porcLoad: number = 0;
  public produtos: Array<object>;
  public totalCarrinho: string;
  public totalCarrinhoNum: any;
  public heightW: any;
  public formsPg: Array<string> = [];
  public bandeiras: Array<string> = [];
  public redeAutoriza: Array<string> = [];
  public parcelas: Array<string> = [];
  public opcsCard = {bloqDebito: true, bloqCredito: true, parcelasMax: 0};
  public metodoPg: string = 'Não selecionado';
  public bandeiraPg: string = 'Não selecionado';
  public redeAutorizaPg: string = 'Não selecionado';
  public debitOrCreditPg: string = 'Não selecionado';
  public tipoCartaoPg: string;
  public parcelasPg: string = 'Não selecionado';;
  private allPagMetods: any;
  private caixaMovelStorage: any;

  constructor(
    private storage: Storage,
    public alertController: AlertController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    public loadingController: LoadingController,
    private platform: Platform,
    private storageService: StorageService,
    private pagamentoService: PagamentoService
  ) { }

//swiper
  slideNext(){
    this.swiper.swiperRef.slideNext();
    setTimeout(() => {
      this.scrollToTop();
      }, 300);
    }

  slidePrev(){
    this.swiper.swiperRef.slidePrev();
  }

//main
  async ngOnInit() {
    this.getMetodosPag();
    this.heightW = this.platform.height();
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.produtos = this.caixaMovelStorage.vendas.carrinho;
    this.totalCar();
  }

  ionViewWillLeave(){
    this.closeModal();
  }

  scrollToTop() {
    this.content.scrollToTop(300);
  }

  async getMetodosPag(){
    const loading = await this.loadingController.create({
      message: 'Aguarde...'
    });
    await loading.present();
    this.pagamentoService.all('1').subscribe(async (res: any) => {
      this.allPagMetods = res.formasPagamento;
      console.log(this.allPagMetods);
      for(const formspg of this.allPagMetods){
        if (!this.formsPg.includes(formspg['FORMA_PG'])) {
          this.formsPg.push(formspg['FORMA_PG']);
        }
        if (!this.bandeiras.includes(formspg['BANDEIRA']) && formspg['BANDEIRA'] !== '') {
          this.bandeiras.push(formspg['BANDEIRA']);
        }
      }
      await loading.dismiss();
    });
  }

  changeFormaPagamento(formPg: string){
    this.metodoPg = formPg;
    if(this.metodoPg === 'DINHEIRO' || this.metodoPg === 'PIX'){
      this.subirModal();
    } else {
      this.slideNext();
    }
    this.porcLoad = this.metodoPg === 'DINHEIRO' || this.metodoPg === 'PIX' ? 1 : .2;
  }

  changeBandeira(bandeira: string){
    this.redeAutoriza = [];
    this.bandeiraPg = bandeira;
    for(const formspg of this.allPagMetods){
      if (!this.redeAutoriza.includes(formspg['REDE_AUTORIZA']) && formspg['FORMA_PG'] === 'CARTÃO' && formspg['BANDEIRA'] === this.bandeiraPg ) {
        this.redeAutoriza.push(formspg['REDE_AUTORIZA']);
      }
    }
    this.porcLoad = .4;
    this.slideNext();
  }

  changeRedeAutoriza(rede){
    this.opcsCard = {bloqDebito: true, bloqCredito: true, parcelasMax: 0};
    this.redeAutorizaPg = rede;
    let i = -1;
    for(const formspg of this.allPagMetods){
      i++;
      if (formspg['FORMA_PG'] === 'CARTÃO' && formspg['BANDEIRA'] === this.bandeiraPg && formspg['REDE_AUTORIZA'] === this.redeAutorizaPg ) {
        this.opcsCard.bloqDebito = this.allPagMetods[i]['DEBITO_CREDITO'] === 'D' ? false : this.opcsCard.bloqDebito;
        this.opcsCard.bloqCredito = this.allPagMetods[i]['DEBITO_CREDITO'] === 'C' ? false : this.opcsCard.bloqCredito;
        this.opcsCard.parcelasMax = this.allPagMetods[i]['PARCELAS'] > this.opcsCard.parcelasMax ? this.allPagMetods[i]['PARCELAS'] : this.opcsCard.parcelasMax;
      }
    }
    this.porcLoad = .6;
    this.slideNext();
  }

  changeDebitOrCredit(opc){
    this.debitOrCreditPg = opc;
    if(opc === 'DÉBITO'){
      this.porcLoad = 1;
      this.subirModal();
    } else {
      this.parcelas = [];
      for(let i = 1; i <= this.opcsCard.parcelasMax; i++){
        this.parcelas.push(i+'x de '+this.convertReal(i*this.totalCarrinhoNum));
        console.log(this.parcelas);
      }
      this.porcLoad = .8;
      this.slideNext();
    }
  }

  changeParcelas(parcela){
    this.parcelasPg = parcela;
    this.porcLoad = 1;
    this.subirModal();
  }

//modal

  verificaModal(){
    this.modal.getCurrentBreakpoint().then((value) => {
      if(value !== 0.07){
        this.descerModal();
      };
    });
  }

  descerModal(){
    this.modal.setCurrentBreakpoint(0.07);
  }

  subirModal(){
    this.modal.setCurrentBreakpoint(this.heightW > 785 ? 0.35 : 0.8);
  }

  closeModal(){
    this.modal.dismiss();
  }

//total-carrinho
  convertReal(valor){
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
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
        this.totalCarrinhoNum = valores.reduce((a, b) => a + b, 0);
      }
    }
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
            this.produtos = [];
            this.totalCar();
            this.caixaMovelStorage.vendas.carrinho = this.produtos;
            await this.storage.set('caixa-movel', this.caixaMovelStorage);
            this.navCtrl.navigateBack('/home/caixa-movel');
          },
        },
      ],
    });
    await alert.present();
  }
}
