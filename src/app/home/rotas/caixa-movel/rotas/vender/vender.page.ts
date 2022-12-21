import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { SwiperComponent } from 'swiper/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { NgForm } from '@angular/forms';
import { ClientesService } from './services/clientes/clientes.service';

@Component({
  selector: 'app-vender',
  templateUrl: './vender.page.html',
  styleUrls: ['./vender.page.scss'],
})
export class VenderPage implements OnInit {

  @ViewChild('swiper') swiper: SwiperComponent;
  @ViewChild('modalCliente') modalCliente: any;

  public identificarClientSld = false;
  private caixaMovelStorage: any;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private navCtrl: NavController,
    private storage: Storage,
    private clientesService: ClientesService,
    private storageService: StorageService,
  ) { }

  async ngOnInit() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
  }

  //nova venda

  async novaVenda(cpfCliente = null, idCliente = null){
    this.modalCliente.dismiss();
    this.caixaMovelStorage.sistemaVendas.vendaAtual = {
      dataInicio: new Date().getTime(),
      produtosList: [],
      pagList: [],
      selectIds: {
        fireBirdIdCc: '1',
        fireBirdIdEmp: '1',
        userId: '3',
        vendaId: '2150',
        cpfCliente,
        idCliente
      }
    };
    await this.storage.set('caixa-movel', this.caixaMovelStorage);
  }

  async verificaNovaVenda(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Venda não finalizada',
      message: 'Você deseja voltar a venda ANTERIOR ou iniciar uma NOVA?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'ANTERIOR',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: () => {
            this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/scanner');
          },
        },
        {
          text: 'NOVA',
          id: 'confirm-button',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cancelando venda anterior, aguarde...'
            });
            await loading.present();
            setTimeout(async () => {
              await loading.dismiss();
              const loadingCreat = await this.loadingController.create({
                message: 'Iniciando nova venda, aguarde...'
              });
              await loadingCreat.present();
              setTimeout(async () => {
                await loadingCreat.dismiss();
                this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/scanner');
              }, 1000);
            }, 1000);
          },
        },
      ],
    });
    await alert.present();
  }

  //identificar cliente

  identificarCliente(){
    console.log(this.modalCliente);
    this.modalCliente.present();
  }

  buscarCliente(form: NgForm){
    const inputs = form.value;
    console.log();
    this.clientesService.getClientes(inputs.nome, inputs.cpf).subscribe((res) => {
      console.log(res);
    });
  }

//swiper
  slideNext(){
    this.swiper.swiperRef.slideNext();
  }

  slidePrev(){
    this.swiper.swiperRef.slidePrev();
  }

  toIdentSld(){
    this.identificarClientSld = true;
    setTimeout(() => {
      this.slideNext();
    }, 200);
  }
}
