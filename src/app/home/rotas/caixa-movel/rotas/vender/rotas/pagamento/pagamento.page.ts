/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SwiperComponent } from 'swiper/angular';

@Component({
  selector: 'app-pagamento',
  templateUrl: './pagamento.page.html',
  styleUrls: ['./pagamento.page.scss'],
})
export class PagamentoPage implements OnInit {

  @ViewChild('swiper') swiper: SwiperComponent;

  public produtos: Array<object>;
  public totalCarrinho: string;
  public totalCarrinhoNum: any;
  private caixaMovelStorage: any;

  constructor(
    private storage: Storage,
    public alertController: AlertController,
    private navCtrl: NavController,
    private storageService: StorageService
  ) { }

//swiper
  slideNext(){
      this.swiper.swiperRef.slideNext();
    }

  slidePrev(){
    this.swiper.swiperRef.slidePrev();
  }

//code
  async ngOnInit() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.produtos = this.caixaMovelStorage.vendas.carrinho;
    this.totalCar();
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

}
