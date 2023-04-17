/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { timeout } from 'rxjs/operators';
import { EstoqueService } from './rotas/estoque/services/estoque/estoque.service';

@Component({
  selector: 'app-caixa-movel',
  templateUrl: './caixa-movel.page.html',
  styleUrls: ['./caixa-movel.page.scss'],
})
export class CaixaMovelPage implements OnInit {

  @ViewChild('popOver') popOver: any;
  @ViewChild('ionSelect') ionSelect: any;

  public conectadoServeLocal = false;
  public btnServerLocal = true;
  public centroscustos = [];
  public consultaNome = false;
  public estoqueStorageHist: any;
  public idEmpBird: string;
  public idCcSql: string;
  public ipLocal: string;
  public idCc: string;
  public recentesExist = false;

  // storage
  private auth: any;
  private multiEmpresaStorage: any;
  private caixaMovelStorage: any;

  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController,
    public toastController: ToastController,
    private estoqueService: EstoqueService,
    private storage: Storage,
    private storageService: StorageService,
    private navCtrl: NavController,
  ) {}

  async ngOnInit() {
    this.auth = await this.storage.get('auth');
    this.multiEmpresaStorage = await this.storage.get('multiEmpresa');
    if(await this.storage.get('caixa-movel') === null){
      await this.storage.set('caixa-movel',
        {
          sistemaVendas: {vendaAtual: null, configuracoes: {modoRapido: false}},
          configuracoes: {slectedIds: {firebirdIdEmp: null, fireBirdIdCc: null, sqlIdCc: null, ipLocal: null }}}
        );
      this.caixaMovelStorage = await this.storage.get('caixa-movel');
    } else {
      this.caixaMovelStorage = await this.storage.get('caixa-movel');
      if(this.caixaMovelStorage.configuracoes.slectedIds.ipLocal === undefined ||
        this.caixaMovelStorage.sistemaVendas === undefined ||
        this.caixaMovelStorage.sistemaVendas === null){
        await this.storage.set('caixa-movel',
          {
            sistemaVendas: {vendaAtual: null, configuracoes: {modoRapido: false}},
            configuracoes: {slectedIds: {firebirdIdEmp: null, fireBirdIdCc: null, sqlIdCc: null, ipLocal: null }}}
          );
          this.caixaMovelStorage = await this.storage.get('caixa-movel');
      }
    }
    const ccStorage = Object.values(this.multiEmpresaStorage.empresas[this.auth.empresa.id].centrodecustos);
    for(const ccs of ccStorage){
      this.centroscustos.push({
        nome: ccs['unidade'],
        empIdFb: ccs['idEmpBird'],
        ccIdFb: ccs['idCcBird'],
        ccIdSql: ccs['idCentroCusto'],
        ipLocal: ccs['servidorLocal']
      });
    }
  }

  async centroscustosChange(cc) {
    this.idCc = cc.detail.value.ccFire;
    this.idCcSql = cc.detail.value.ccSql;
    this.idEmpBird = cc.detail.value.empFire;
    this.ipLocal = cc.detail.value.ipLocal;
    this.caixaMovelStorage.configuracoes.slectedIds.firebirdIdEmp = this.idEmpBird;
    this.caixaMovelStorage.configuracoes.slectedIds.fireBirdIdCc = this.idCc;
    this.caixaMovelStorage.configuracoes.slectedIds.sqlIdCc = this.idCcSql;
    this.caixaMovelStorage.configuracoes.slectedIds.ipLocal = this.ipLocal;
    await this.storage.set('caixa-movel', this.caixaMovelStorage);
  }

  navigateSistemaVendas() {
    if (this.idCc === undefined) {
      this.popOver.present();
    } else {
      this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas');
    }
  }

  navigateRelatorios() {
    if (this.idCcSql === undefined) {
      this.popOver.present();
    } else {
      this.navCtrl.navigateForward('/home/caixa-movel/relatorios');
    }
  }

  navigateEstoque() {
    if (this.idCc === undefined) {
      this.popOver.present();
    } else {
      this.navCtrl.navigateForward('/home/caixa-movel/estoque');
    }
  }

  popOverCloseEvent(){
    this.ionSelect.open();
  }
}
