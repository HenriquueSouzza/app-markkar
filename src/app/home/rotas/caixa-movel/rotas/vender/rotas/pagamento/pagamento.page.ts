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
  public parcelasPg: string = 'Não selecionado';
  public parcelasPgNum: string = 'Não selecionado';
  public bloqFinishPg: boolean = true;
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
    this.bloqFinishPg = true;
    this.bandeiraPg = 'Não selecionado';
    this.debitOrCreditPg = 'Não selecionado';
    this.redeAutorizaPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
    this.metodoPg = formPg;
    if(this.metodoPg === 'DINHEIRO' || this.metodoPg === 'PIX'){
      this.bloqFinishPg = false;
      this.subirModal();
    } else {
      this.slideNext();
    }
    setTimeout(() => {
      this.porcLoad = this.metodoPg === 'DINHEIRO' || this.metodoPg === 'PIX' ? 1 : .2;
    }, 250);
  }

  changeBandeira(bandeira: string){
    this.bloqFinishPg = true;
    this.debitOrCreditPg = 'Não selecionado';
    this.redeAutorizaPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
    this.redeAutoriza = [];
    this.bandeiraPg = bandeira;
    for(const formspg of this.allPagMetods){
      if (!this.redeAutoriza.includes(formspg['REDE_AUTORIZA']) && formspg['FORMA_PG'] === 'CARTÃO' && formspg['BANDEIRA'] === this.bandeiraPg ) {
        this.redeAutoriza.push(formspg['REDE_AUTORIZA']);
      }
    }
    setTimeout(() => {
      this.porcLoad = .4;
    }, 250);
    this.slideNext();
  }

  changeRedeAutoriza(rede){
    this.bloqFinishPg = true;
    this.debitOrCreditPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
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
    setTimeout(() => {
      this.porcLoad = .6;
    }, 250);
    this.slideNext();
  }

  changeDebitOrCredit(opc){
    this.debitOrCreditPg = opc;
    this.bloqFinishPg = true;
    if(opc === 'DÉBITO'){
      this.parcelasPg = 'Não selecionado';
      setTimeout(() => {
        this.porcLoad = 1;
      }, 250);
      this.bloqFinishPg = false;
      this.subirModal();
    } else {
      this.parcelas = [];
      for(let i = 1; i <= this.opcsCard.parcelasMax; i++){
        this.parcelas.push(i+'x de '+this.convertReal(i*this.totalCarrinhoNum));
        console.log(this.parcelas);
      }
      setTimeout(() => {
        this.porcLoad = .8;
      }, 250);
      this.slideNext();
    }
  }

  changeParcelas(parcela, index){
    this.parcelasPg = parcela;
    this.parcelasPgNum = index + 1;
    setTimeout(() => {
      this.porcLoad = 1;
    }, 250);
    this.bloqFinishPg = false;
    this.subirModal();
  }

  finalizaPg(){
    let formPg = {};
    if (this.metodoPg === 'PIX') {
      let i = -1;
      for(const formspg of this.allPagMetods){
        i++;
        if (formspg['FORMA_PG'] === this.metodoPg) {
          formPg = {
            idEmp: 1,
            sigla: formspg['SIGLA'],
            dc: formspg['DEBITO_CREDITO'],
            parcelas: formspg['PARCELAS'],
            bandeira: formspg['BANDEIRA'],
            redeAutoriza: formspg['REDE_AUTORIZA']
          };
          console.log(formspg);
        }
      }
    } else {
      formPg = {
        idEmp: 1,
        sigla: this.metodoPg === 'DINHEIRO' ? 'DIN' : this.metodoPg === 'CARTÃO' ? 'CRT' : this.metodoPg,
        dc: this.debitOrCreditPg === 'DÉBITO' ? 'D' : this.debitOrCreditPg === 'CRÉDITO' ? 'C' : null,
        parcelas: this.parcelasPg === 'Não selecionado' ? 0 : this.parcelasPgNum,
        bandeira: this.bandeiraPg === 'Não selecionado' ? null : this.bandeiraPg,
        redeAutoriza: this.redeAutorizaPg === 'Não selecionado' ? null : this.redeAutorizaPg
      };
    }
    this.pagamentoService.pgmtDetalhe('1', formPg).subscribe((res) => {
      console.log(res);
    });
  }

//modal
  downModalIfOpen(){
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
}