/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController, NavController } from '@ionic/angular';
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
  public opcsCard = {debito: false, credito: false, parcelas: 0};
  public metodoPg: string = 'Não selecionado';
  public bandeiraPg: string = 'Não selecionado';
  public redeAutorizaPg: string = 'Não selecionado';
  public tipoCartaoPg: string;
  public parcelasPg: number;
  private allPagMetods: any;
  private caixaMovelStorage: any;

  constructor(
    private storage: Storage,
    public alertController: AlertController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
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

//code
  async ngOnInit() {
    this.pagamentoService.all('1').subscribe((res: any) => {
      this.allPagMetods = res.formasPagamento;
      console.log(this.allPagMetods);
      let i = -1;
      for(const formspg of this.allPagMetods){
        i++;
        if (!this.formsPg.includes(formspg['FORMA_PG'])) {
          this.formsPg.push(formspg['FORMA_PG']);
        }
        if (!this.bandeiras.includes(formspg['BANDEIRA']) && formspg['BANDEIRA'] !== '') {
          this.bandeiras.push(formspg['BANDEIRA']);
        }
        if (!this.redeAutoriza.includes(formspg['REDE_AUTORIZA']) && formspg['REDE_AUTORIZA'] !== '') {
          this.redeAutoriza.push(formspg['REDE_AUTORIZA']);
        }
        if (formspg['FORMA_PG'] === 'CARTÃO' && formspg['BANDEIRA'] === 'HIPERCARD' && formspg['REDE_AUTORIZA'] === 'REDECARD') {
          this.opcsCard.debito = this.allPagMetods[i]['DEBITO_CREDITO'] === 'D' ? true : this.opcsCard.debito;
          this.opcsCard.credito = this.allPagMetods[i]['DEBITO_CREDITO'] === 'C' ? true : this.opcsCard.credito;
          this.opcsCard.parcelas = this.allPagMetods[i]['PARCELAS'] > this.opcsCard.parcelas ? this.allPagMetods[i]['PARCELAS'] : this.opcsCard.parcelas;
          console.log(i);
        }
        console.log(this.formsPg);
      }
    });
    this.heightW = this.platform.height();
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.produtos = this.caixaMovelStorage.vendas.carrinho;
    this.totalCar();
  }

  ionViewWillLeave(){
    this.closeModal();
  }

  subirModal(){
    this.modal.setCurrentBreakpoint(this.heightW > 785 ? 0.35 : 0.8);
  }

  closeModal(){
    this.modal.dismiss();
  }

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

  scrollToTop() {
    this.content.scrollToTop(300);
  }

}
