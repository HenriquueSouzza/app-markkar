import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  IonContent,
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular';
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
  @ViewChild('inputValor') inputValor: any;
  @ViewChild(IonContent) content: IonContent;

  public porcLoad = 0;
  public produtos: Array<object>;
  public totalCarrinho: string;
  public totalCarrinhoNum: any;
  public heightW: any;
  public formsPg: Array<string> = [];
  public bandeiras: Array<string> = [];
  public redeAutoriza: Array<string> = [];
  public parcelas: Array<string> = [];
  public opcsCard = { bloqDebito: true, bloqCredito: true, parcelasMax: 0 };
  public valorPg = 0;
  public metodoPg: string;
  public bandeiraPg: string;
  public redeAutorizaPg: string;
  public debitOrCreditPg: string;
  public tipoCartaoPg: string;
  public parcelasPg: string;
  public parcelasPgNum: string;
  public bloqAdcPg = true;
  public totalPagoCliente = 0;
  private allPagMetods: any;
  private caixaMovelStorage: any;
  private empId: string;

  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController,
    private storage: Storage,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private platform: Platform,
    private storageService: StorageService,
    private pagamentoService: PagamentoService
  ) {
    this.heightW = this.platform.height();
  }

  //main

  ngOnInit() {}

  async ionViewWillEnter() {
    this.metodoPg = 'Não selecionado';
    this.bandeiraPg = 'Não selecionado';
    this.debitOrCreditPg = 'Não selecionado';
    this.redeAutorizaPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
    this.parcelasPgNum = 'Não selecionado';
    this.getMetodosPag();
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.produtos =
      this.caixaMovelStorage.sistemaVendas.vendaAtual.produtosList;
    this.empId =
      this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.fireBirdIdEmp;
    this.totalCar();
    this.verificaValorTotal();
    this.inputValor.value = '0,00';
  }

  ionViewDidEnter() {
    this.openModal();
  }

  ionViewWillLeave() {
    this.closeModal();
  }

  scrollToTop() {
    this.content.scrollToTop(300);
  }

  async getMetodosPag() {
    const loading = await this.loadingController.create({
      message: 'Aguarde...',
    });
    await loading.present();
    this.pagamentoService.all(this.empId, this.caixaMovelStorage.configuracoes.slectedIds.ipLocal).subscribe({next: async (res: any) => {
      this.allPagMetods = res.formasPagamento;

      this.formsPg = Array.from(
        new Set(this.allPagMetods.map((formspg) => formspg.FORMA_PG))
      );

      this.bandeiras = Array.from(
        new Set(
          this.allPagMetods
            .filter((formspg) => formspg.BANDEIRA !== '')
            .map((formspg) => formspg.BANDEIRA)
        )
      );
      await loading.dismiss();
      this.subirModal();
  }, error: async (err) => {
    this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas/atual');
    await this.exibirAlerta('Erro ao tentar comunicar com o servidor local.');
    await loading.dismiss();
  }});
  }

  changeValorPagamento(event) {
    this.metodoPg = 'Não selecionado';
    this.bandeiraPg = 'Não selecionado';
    this.debitOrCreditPg = 'Não selecionado';
    this.redeAutorizaPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
    const inputMask = this.maskMoney(event.detail.value);
    this.inputValor.value = inputMask;
    this.valorPg = parseFloat(inputMask.replace('.', '').replace(',', '.'));
  }

  aplicaValorPagamento(valorTotal: boolean) {
    if (valorTotal === true) {
      this.inputValor.value = Number(
        this.totalCarrinhoNum - this.totalPagoCliente < 0
          ? 0
          : this.totalCarrinhoNum - this.totalPagoCliente
      ).toFixed(2);
    } else {
      if (this.valorPg !== 0) {
        this.slideNext();
      }
    }
  }

  changeFormaPagamento(formPg: string) {
    this.bandeiraPg = 'Não selecionado';
    this.debitOrCreditPg = 'Não selecionado';
    this.redeAutorizaPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
    this.metodoPg = formPg;
    if (this.metodoPg === 'DINHEIRO' || this.metodoPg === 'PIX') {
      this.subirModal();
      this.bloqAdcPg = false;
    } else {
      this.bloqAdcPg = true;
      this.slideNext();
    }
    setTimeout(() => {
      this.porcLoad =
        this.metodoPg === 'DINHEIRO' || this.metodoPg === 'PIX' ? 1 : 0.2;
    }, 250);
  }

  changeBandeira(bandeira: string) {
    this.debitOrCreditPg = 'Não selecionado';
    this.redeAutorizaPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
    this.redeAutoriza = [];
    this.bandeiraPg = bandeira;
    for (const formspg of this.allPagMetods) {
      if (
        !this.redeAutoriza.includes(formspg.REDE_AUTORIZA) &&
        formspg.FORMA_PG === 'CARTÃO' &&
        formspg.BANDEIRA === this.bandeiraPg
      ) {
        this.redeAutoriza.push(formspg.REDE_AUTORIZA);
      }
    }
    setTimeout(() => {
      this.porcLoad = 0.4;
    }, 250);
    this.bloqAdcPg = true;
    this.slideNext();
  }

  changeRedeAutoriza(rede) {
    this.debitOrCreditPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
    this.opcsCard = { bloqDebito: true, bloqCredito: true, parcelasMax: 0 };
    this.redeAutorizaPg = rede;

    const cardMethods = this.allPagMetods.filter(
      (formspg) =>
        formspg.FORMA_PG === 'CARTÃO' &&
        formspg.BANDEIRA === this.bandeiraPg &&
        formspg.REDE_AUTORIZA === this.redeAutorizaPg
    );

    if (cardMethods.length > 0) {
      const debitMethod = cardMethods.find(
        (formspg) => formspg.DEBITO_CREDITO === 'D'
      );
      const creditMethod = cardMethods.find(
        (formspg) => formspg.DEBITO_CREDITO === 'C'
      );
      const maxInstallments = Math.max(
        ...cardMethods.map((formspg) => formspg.PARCELAS)
      );

      if (debitMethod) {
        this.opcsCard.bloqDebito = false;
      }

      if (creditMethod) {
        this.opcsCard.bloqCredito = false;
      }

      this.opcsCard.parcelasMax = maxInstallments;
    }
    setTimeout(() => {
      this.porcLoad = 0.6;
    }, 250);
    this.bloqAdcPg = true;
    this.slideNext();
  }

  changeDebitOrCredit(opc) {
    this.debitOrCreditPg = opc;
    if (opc === 'DÉBITO') {
      this.parcelasPg = 'Não selecionado';
      setTimeout(() => {
        this.porcLoad = 1;
      }, 250);
      this.subirModal();
    } else {
      this.parcelas = [];
      for (let i = 1; i <= this.opcsCard.parcelasMax; i++) {
        this.parcelas.push(
          i + 'x de ' + this.convertReal(this.totalCarrinhoNum / i)
        );
      }
      setTimeout(() => {
        this.porcLoad = 0.8;
      }, 250);
      this.bloqAdcPg = true;
      this.slideNext();
    }
  }

  changeParcelas(parcela, index) {
    this.parcelasPg = parcela;
    this.parcelasPgNum = index + 1;
    setTimeout(() => {
      this.porcLoad = 1;
    }, 250);
    this.bloqAdcPg = false;
    this.subirModal();
  }

  async addPg() {
    setTimeout(() => {
      this.porcLoad = 0;
    }, 250);
    this.bloqAdcPg = true;
    const loading = await this.loadingController.create({
      message: 'Adicionando pagamento, Aguarde...',
    });
    await loading.present();
    let formPg = {};
    if (this.metodoPg === 'PIX') {
      let i = -1;
      for (const formspg of this.allPagMetods) {
        i++;
        if (formspg.FORMA_PG === this.metodoPg) {
          formPg = {
            idEmp: this.empId,
            sigla: formspg.SIGLA,
            dc: formspg.DEBITO_CREDITO,
            parcelas: formspg.PARCELAS,
            bandeira: formspg.BANDEIRA,
            redeAutoriza: formspg.REDE_AUTORIZA,
          };
        }
      }
    } else {
      formPg = {
        idEmp: this.empId,
        sigla:
          this.metodoPg === 'DINHEIRO'
            ? 'DIN'
            : this.metodoPg === 'CARTÃO'
            ? 'CRT'
            : this.metodoPg,
        dc:
          this.debitOrCreditPg === 'DÉBITO'
            ? 'D'
            : this.debitOrCreditPg === 'CRÉDITO'
            ? 'C'
            : null,
        parcelas:
          this.parcelasPg === 'Não selecionado' ? 0 : this.parcelasPgNum,
        bandeira:
          this.bandeiraPg === 'Não selecionado' ? null : this.bandeiraPg,
        redeAutoriza:
          this.redeAutorizaPg === 'Não selecionado'
            ? null
            : this.redeAutorizaPg,
      };
    }
    this.pagamentoService.pgmtDetalhe(this.empId, formPg, this.caixaMovelStorage.configuracoes.slectedIds.ipLocal).subscribe(
      async (res: any) => {
        if (res.codigosPg.err === '' || res.codigosPg.err === null) {
          const pagIds = {
            valor: this.valorPg,
            empId: this.empId,
            formaPg: formPg,
            ...res.codigosPg,
          };
          delete pagIds.err;
          this.caixaMovelStorage.sistemaVendas.vendaAtual.pagList.push(pagIds);
          await this.storage.set('caixa-movel', this.caixaMovelStorage);
          this.verificaValorTotal();
          this.resetNovoPagamento();
          setTimeout(async () => {
            await loading.dismiss();
          }, 1000);
        } else {
          await this.exibirAlerta('Erro ao tentar adicionar o pagamento.', res.codigosPg.err);
          await loading.dismiss();
        }
      },
      async (error) => {
        this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas/atual');
        await this.exibirAlerta('Erro ao tentar comunicar com o servidor local.');
        await loading.dismiss();
      }
    );
  }

  verificaValorTotal() {
    if (this.caixaMovelStorage.sistemaVendas.vendaAtual.pagList.length > 0) {
      const valores =
        this.caixaMovelStorage.sistemaVendas.vendaAtual.pagList.map(
          (pagamento) => pagamento.valor
        );
      const pagamentoTotal = valores.reduce((a, b) => a + b, 0);
      this.totalPagoCliente = pagamentoTotal;
    } else {
      this.totalPagoCliente = 0;
    }
  }

  resetNovoPagamento() {
    this.valorPg = 0;
    this.inputValor.value = '';
    this.metodoPg = 'Não selecionado';
    this.bandeiraPg = 'Não selecionado';
    this.debitOrCreditPg = 'Não selecionado';
    this.redeAutorizaPg = 'Não selecionado';
    this.parcelasPg = 'Não selecionado';
    this.movePrimeiroSlide();
  }
  //modal
  downModalIfOpen() {
    this.modal.getCurrentBreakpoint().then((value) => {
      if (value !== 0.07) {
        this.descerModal();
      }
    });
  }

  descerModal() {
    this.modal.setCurrentBreakpoint(0.07);
  }

  subirModal() {
    this.modal.setCurrentBreakpoint((500 / this.heightW) > 1 ? 1 : (500 / this.heightW));
  }

  closeModal() {
    this.modal.dismiss();
  }

  openModal() {
    this.modal.present();
  }

  voltarAtual(){
    this.navCtrl.navigateBack('/home/caixa-movel/sistema-vendas/atual');
  }

  finalizarVenda(){
    this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/atual/lista-itens/estoque');
  }

  //total-carrinho

  maskMoney(inputValue) {
    /* CONVERT EMPTY STRING TO 0 */
    if (!inputValue) {
      inputValue = 0;
    }
    /* REMOVE ALL NON-NUMERIC CHARACTERS */
    inputValue = parseInt(inputValue.toString().replace(/\D/g, ''), 10);

    /* ADD DECIMAL SEPARATOR ',' AND THOUSANDS SEPARATOR '.' */
    if (inputValue.toString().length > 2) {
      inputValue = (inputValue / 100)
        .toFixed(2)
        .replace(/\./g, ',')
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else {
      inputValue = (inputValue / 100).toFixed(2).replace('.', ',');
    }
    /* RETURN FORMATTED CURRENCY VALUE */
    return inputValue;
  }

  convertReal(valor) {
    return parseFloat(valor).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  totalCar() {
    const valores = this.produtos.map(
      (produto: any) => produto.valor * produto.qnt
    );
    this.totalCarrinhoNum = valores.reduce((a, b) => a + b, 0);
    this.totalCarrinho = this.convertReal(this.totalCarrinhoNum);
  }

  //swiper

  movePrimeiroSlide() {
    this.swiper.swiperRef.slideTo(0);
  }

  slideNext() {
    this.swiper.swiperRef.slideNext();
    setTimeout(() => {
      this.scrollToTop();
    }, 300);
  }

  slidePrev() {
    this.swiper.swiperRef.slidePrev();
  }

  // erros
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
}
