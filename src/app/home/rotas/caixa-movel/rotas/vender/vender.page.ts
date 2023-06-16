/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { SwiperComponent } from 'swiper/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { NgForm } from '@angular/forms';
import { VendaService } from './rotas/atual/services/venda/venda.service';
import { timeout } from 'rxjs/operators';

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
  public criarClientSld = false;
  public bloqBtnSubNomeCriar = true;
  public bloqBtnSubCpfCriar = true;
  public bloqBtnSubTelCriar = false;
  public bloqBtnSubEmailCriar = false;
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
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    //loadStorage
    this.auth = await this.storage.get('auth');
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.idEmpBird =
      this.caixaMovelStorage.configuracoes.slectedIds.firebirdIdEmp;
    this.idCc = this.caixaMovelStorage.configuracoes.slectedIds.fireBirdIdCc;
    this.idUserBird = this.auth.usuario.idFireBird;
  }

  //nova venda

  async novaVenda(
    cpfCliente = null,
    idCliente = null,
    nomeCliente = null,
    somenteCpf = false
  ) {
    let cpf = cpfCliente;
    this.fecharModalIdentificarCliente();
    if (!somenteCpf) {
      cpf = null;
    }
    const loading = await this.loadingController.create({
      message: 'Iniciando a venda, aguarde...',
    });
    await loading.present();
    this.vendaService
      .iniciar(
        this.idEmpBird,
        this.idCc,
        this.idUserBird,
        cpf,
        idCliente,
        this.caixaMovelStorage.configuracoes.slectedIds.ipLocal
      )
      .pipe(timeout(3000))
      .subscribe({
        next: async (res: any) => {
          if (res.novaVenda['COD_VENDA'] === '-1') {
            this.erroAlert(
              'Erro ao iniciar a venda:',
              res.novaVenda['STATUS'].toLowerCase()
            );
            await loading.dismiss();
          } else {
            this.caixaMovelStorage.sistemaVendas.vendaAtual = {
              dataInicio: new Date().getTime(),
              produtosList: [],
              pagList: [],
              clienteInfo: {
                cpf: cpfCliente,
                id: idCliente,
                nome: nomeCliente,
              },
              selectIds: {
                fireBirdIdEmp: this.idEmpBird,
                fireBirdIdCc: this.idCc,
                userId: this.idUserBird,
                vendaId: res.novaVenda['COD_VENDA'],
                caixaId: res.novaVenda['COD_CAIXA'],
              },
            };
            await loading.dismiss();
            await this.storage.set('caixa-movel', this.caixaMovelStorage);
            this.navCtrl.navigateForward(
              '/home/caixa-movel/sistema-vendas/atual'
            );
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.erroAlert(
            'Erro ao iniciar a venda:',
            'Erro ao conectar com o servidor local'
          );
        },
      });
  }

  async verificaNovaVenda() {
    if (this.idUserBird === null) {
      this.erroAlert(
        'Erro ao iniciar a venda:',
        'Não é possível realizar venda com uma conta \'mkadmin\'.'
      );
    } else if (this.caixaMovelStorage.sistemaVendas.vendaAtual !== null) {
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
              this.navCtrl.navigateForward(
                '/home/caixa-movel/sistema-vendas/atual'
              );
            },
          },
          {
            text: 'NOVA',
            id: 'confirm-button',
            handler: async () => {
              const loading = await this.loadingController.create({
                message: 'Cancelando venda anterior, aguarde...',
              });
              await loading.present();
              this.vendaService
                .cancelar(
                  this.caixaMovelStorage.sistemaVendas.vendaAtual.selectIds
                    .vendaId,
                  this.caixaMovelStorage.configuracoes.slectedIds.ipLocal
                )
                .subscribe(
                  async (res: any) => {
                    await loading.dismiss();
                    if (
                      res.status === 'OK' ||
                      res.status.toLowerCase() === 'a venda já foi cancelada' ||
                      res.status.toLowerCase() === 'a venda já foi fechada' ||
                      res.status.toLowerCase() ===
                        'a venda já foi realizada no sistema'
                    ) {
                      this.caixaMovelStorage.sistemaVendas.vendaAtual = null;
                      await this.storage.set(
                        'caixa-movel',
                        this.caixaMovelStorage
                      );
                      this.abrirModalIdentificarCliente();
                    } else {
                      await loading.dismiss();
                      this.erroAlert(
                        'Erro ao cancelar a venda:',
                        res.status.toLowerCase()
                      );
                    }
                  },
                  async (err) => {
                    await loading.dismiss();
                    this.erroAlert(
                      'Erro ao cancelar a venda:',
                      'Erro ao conectar com o servidor local'
                    );
                  }
                );
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
  abrirModalIdentificarCliente() {
    this.modalCliente.present();
  }

  fecharModalIdentificarCliente() {
    this.modalCliente.dismiss();
  }

  buscarCliente(form: NgForm) {
    const inputs = form.value;
    this.vendaService
      .buscarClientes(
        inputs.nome,
        inputs.cpf,
        this.caixaMovelStorage.configuracoes.slectedIds.ipLocal
      )
      .subscribe((res: any) => {
        this.clientesList =
          res.clientes === null
            ? [{ NOME_CLIENTE: 'Não encontrado', DOCUMENTO: '' }]
            : res.clientes;
      });
  }

  selecionarCliente(idCliente, nome, cpf) {
    this.novaVenda(cpf, idCliente, nome, false);
  }

  selecionarSomenteCpf(form: NgForm) {
    this.novaVenda(form.value.cpf, null, null, true);
  }

  changeInpNome(event) {
    if (event.detail.value.length > 2) {
      this.bloqBtnSubInpNome = false;
    } else {
      this.bloqBtnSubInpNome = true;
    }
  }

  changeInpCpf(event) {
    if (event.detail.value.length === 11) {
      this.bloqBtnSubInpCpf = false;
    } else {
      this.bloqBtnSubInpCpf = true;
    }
  }

  // criar cliente
  cadastrarCliente(form: NgForm) {
    const inputForm = form.value;
    const nome = inputForm.nome.trim().toUpperCase();
    const cpf = inputForm.cpf.trim();
    const telefone =
      inputForm.telefone.trim() === '' ? null : inputForm.telefone.trim();
    const email =
      inputForm.email.trim() === ''
        ? null
        : inputForm.email.trim().toUpperCase();
    console.log([
      this.idEmpBird,
      nome,
      cpf,
      telefone,
      email,
      this.caixaMovelStorage.configuracoes.slectedIds.ipLocal,
    ]);
    this.vendaService
      .cadastrarCliente(
        this.idEmpBird,
        inputForm.nome,
        inputForm.cpf,
        telefone,
        email,
        this.caixaMovelStorage.configuracoes.slectedIds.ipLocal
      )
      .subscribe({
        next: async (res: any) => {
          if (res.idCliente === '-1') {
            await this.erroAlert(
              'Ocorreu um erro ao cadastrar o cliente:',
              res.status.charAt(0).toUpperCase() +
              res.status.slice(1).toLowerCase() + '.'
            );
          } else {
            this.selecionarCliente(res.idCliente, nome, cpf);
          }
        },
        error: async (err) => {
          await this.erroAlert(
            'Ocorreu um erro ao cadastrar o cliente:',
            'Falha ao conectar ao servidor local.'
      );},
      });
  }

  checkInpNomeCriar(event) {
    this.bloqBtnSubNomeCriar =
      event.detail.value.trim().length > 2 ? false : true;
  }
  checkInpCpfCriar(event) {
    this.bloqBtnSubCpfCriar =
      event.detail.value.trim().length === 11 ? false : true;
  }
  checkInpTelCriar(event) {
    this.bloqBtnSubTelCriar = true;
    if (
      event.detail.value.trim().length === 11 ||
      event.detail.value.trim().length === 0
    ) {
      this.bloqBtnSubTelCriar = false;
    }
  }
  checkInpEmailCriar(event) {
    this.bloqBtnSubEmailCriar = true;
    const validate = String(event.detail.value.trim())
      .toLowerCase()
      .match(
        // eslint-disable-next-line max-len
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    if (validate || event.detail.value.trim().length === 0) {
      this.bloqBtnSubEmailCriar = false;
    }
  }

  //slides

  slideNext() {
    this.swiper.swiperRef.slideNext();
  }

  slidePrev() {
    this.swiper.swiperRef.slidePrev();
  }

  toSomenteCpfSld() {
    this.somenteCpfClientSld = true;
    setTimeout(() => {
      this.slideNext();
    }, 200);
  }

  backSomenteCpfSld() {
    this.slidePrev();
    setTimeout(() => {
      this.somenteCpfClientSld = false;
    }, 200);
  }

  toIdentSld() {
    this.identificarClientSld = true;
    setTimeout(() => {
      this.slideNext();
    }, 200);
  }

  toCriarSld() {
    this.criarClientSld = true;
    setTimeout(() => {
      this.slideNext();
    }, 200);
  }

  backIdentSld() {
    this.clientesList = [];
    this.slidePrev();
    setTimeout(() => {
      this.identificarClientSld = false;
      this.identificarClientSld = false;
      this.somenteCpfClientSld = false;
      this.criarClientSld = false;
    }, 200);
  }

  // route

toConfig(){
  this.navCtrl.navigateForward(
    '/home/caixa-movel/sistema-vendas/configuracoes'
  );
}

  // erros
  async erroAlert(title, men) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: title,
      message: men,
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
