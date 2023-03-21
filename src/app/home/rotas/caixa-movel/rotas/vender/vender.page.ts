/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { SwiperComponent } from 'swiper/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { NgForm } from '@angular/forms';
import { VendaService } from './rotas/atual/services/venda/venda.service';

@Component({
  selector: 'app-vender',
  templateUrl: './vender.page.html',
  styleUrls: ['./vender.page.scss'],
})
export class VenderPage implements OnInit {

  @ViewChild('swiper') swiper: SwiperComponent;
  @ViewChild('modalCliente') modalCliente: any;

  public bloqBtnSubInpNome = true;
  public bloqBtnSubInpCpf = true;
  public identificarClientSld = false;
  public somenteCpfClientSld = false;
  public clientesList: Array<any>;

  // storage
  private idEmpBird: string;
  private idCc: string;
  private idUserBird: string;
  private caixaMovelStorage: any;
  private auth: any;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private navCtrl: NavController,
    private storage: Storage,
    private vendaService: VendaService,
    private storageService: StorageService,
  ) { }

  ngOnInit() { }

  async ionViewWillEnter(){
    //loadStorage
    this.auth = await this.storage.get('auth');
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.idEmpBird = this.caixaMovelStorage.configuracoes.slectedIds.firebirdIdEmp;
    this.idCc = this.caixaMovelStorage.configuracoes.slectedIds.fireBirdIdCc;
    this.idUserBird = this.auth.usuario.idFireBird;
  }

  //nova venda

  novaVenda(cpfCliente = null, idCliente = null, nomeCliente = null, somenteCpf = false){
    let cpf = cpfCliente;
    this.fecharModalIdentificarCliente();
    if(!somenteCpf){
      cpf = null;
    }
    this.vendaService.iniciar(this.idEmpBird, this.idCc, this.idUserBird, cpf, idCliente).subscribe(async (res: any) => {
      if (res.novaVenda['COD_VENDA'] === '-1'){
        this.erroAlert('Erro ao iniciar a venda:', res.novaVenda['STATUS'].toLowerCase());
      } else {
        this.caixaMovelStorage.sistemaVendas.vendaAtual = {
          dataInicio: new Date().getTime(),
          produtosList: [],
          pagList: [],
          clienteInfo: {
            cpf: cpfCliente,
            id: idCliente,
            nome: nomeCliente
          },
          selectIds: {
            fireBirdIdEmp: this.idEmpBird,
            fireBirdIdCc: this.idCc,
            userId: this.idUserBird,
            vendaId: res.novaVenda['COD_VENDA'],
            caixaId: res.novaVenda['COD_CAIXA']
          }
        };
        await this.storage.set('caixa-movel', this.caixaMovelStorage);
        this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/atual');
      }
    }, (error)=>{
      this.erroAlert('Erro ao iniciar a venda:', 'Erro ao conectar com o servidor local');
    });
  }

  async verificaNovaVenda(){
    if(this.idUserBird === null){
      this.erroAlert('Erro ao iniciar a venda:', 'Não é possível realizar venda com uma conta \'mkadmin\'.');
    }
    else if(this.caixaMovelStorage.sistemaVendas.vendaAtual !== null){
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
              this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/atual');
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
              this.vendaService.cancelar(this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds.vendaId).subscribe(async (res: any)=> {
                await loading.dismiss();
                if (res.status === 'OK' ||
                res.status.toLowerCase() === 'a venda já foi cancelada' ||
                res.status.toLowerCase() === 'a venda já foi fechada' ||
                res.status.toLowerCase() === 'a venda já foi realizada no sistema' ){
                  this.caixaMovelStorage.sistemaVendas.vendaAtual = null;
                  await this.storage.set('caixa-movel', this.caixaMovelStorage);
                  this.abrirModalIdentificarCliente();
                } else {
                  this.erroAlert('Erro ao cancelar a venda:', res.status.toLowerCase());
                };
              }, (err) => {
                this.erroAlert('Erro ao cancelar a venda:', 'Erro ao conectar com o servidor local');
              });
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.abrirModalIdentificarCliente();
    }
  }

  //identificar cliente
  abrirModalIdentificarCliente(){
    this.modalCliente.present();
  }

  fecharModalIdentificarCliente(){
    this.modalCliente.dismiss();
  }

  buscarCliente(form: NgForm){
    const inputs = form.value;
    this.vendaService.buscarClientes(inputs.nome, inputs.cpf).subscribe((res: any) => {
      this.clientesList = res.clientes === null ? [{NOME_CLIENTE: 'Não encontrado', DOCUMENTO: ''}] : res.clientes;
    });
  }

  selecionarCliente(idCliente, nome, cpf){
    this.novaVenda(cpf, idCliente, nome, false);
  }

  selecionarSomenteCpf(form: NgForm){
    this.novaVenda(form.value.cpf, null, null, true);
  }

  changeInpNome(event){
    if(event.detail.value.length > 2){
      this.bloqBtnSubInpNome = false;
    } else {
      this.bloqBtnSubInpNome = true;
    }
  }

  changeInpCpf(event){
    if(event.detail.value.length === 11){
      this.bloqBtnSubInpCpf = false;
    } else {
      this.bloqBtnSubInpCpf = true;
    }
  }


  //slides

  slideNext(){
    this.swiper.swiperRef.slideNext();
  }

  slidePrev(){
    this.swiper.swiperRef.slidePrev();
  }

  toSomenteCpfSld(){
    this.somenteCpfClientSld = true;
    setTimeout(() => {
      this.slideNext();
    }, 200);
  }

  backSomenteCpfSld(){
    this.slidePrev();
    setTimeout(() => {
      this.somenteCpfClientSld = false;
    }, 200);
  }

  toIdentSld(){
    this.identificarClientSld = true;
    setTimeout(() => {
      this.slideNext();
    }, 200);
  }
  backIdentSld(){
    this.clientesList = [];
    this.slidePrev();
    setTimeout(() => {
      this.identificarClientSld = false;
    }, 200);
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
