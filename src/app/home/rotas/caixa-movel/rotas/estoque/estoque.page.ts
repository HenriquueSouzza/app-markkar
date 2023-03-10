/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EstoqueService } from './services/estoque/estoque.service';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.scss'],
})
export class EstoquePage implements OnInit {
  public centroscustos: Array<any>;
  public consultaNome = false;
  public estoqueStorageHist: any;
  public idEmpBird: any;
  public idCc: string;
  public recentesExist = false;
  private estoqueStorage: any;

  // storage
  private caixaMovelStorage: any;

  constructor(
    private storage: Storage,
    private storageService: StorageService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() { }

  async ionViewWillEnter() {
    this.estoqueStorage = await this.storage.get('estoque');
    if (this.estoqueStorage === null) {
      await this.storage.set('estoque', { historico: [] });
      this.estoqueStorage = await this.storage.get('estoque');
    }
    this.estoqueStorageHist = this.estoqueStorage.historico;
    if (this.estoqueStorageHist.length > 0) {
      this.recentesExist = true;
    } else {
      this.recentesExist = false;
      this.estoqueStorage.historico = { nome: '', codeBar: '' };
    }
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.idEmpBird = this.caixaMovelStorage.configuracoes.slectedIds.firebirdIdEmp;
    this.idCc = this.caixaMovelStorage.configuracoes.slectedIds.fireBirdIdCc;
  }

  navigateScanner() {
    this.navCtrl.navigateForward('/home/caixa-movel/estoque/scanner');
  }

  async consultarNome(form: NgForm) {
    this.navCtrl.navigateForward('/home/caixa-movel/estoque/produtos', {
      queryParams: {
        id1: this.idEmpBird,
        id2: this.idCc,
        code: '',
        nome: form.value.nomeProd,
      },
    });
  }

  verificaSearchbar(event) {
    if (event.detail.value.length > 0) {
      this.consultaNome = true;
    } else {
      this.consultaNome = false;
    }
  }

  redirectHist(code) {
    this.navCtrl.navigateForward('/home/caixa-movel/estoque/produtos', {
      queryParams: { id1: this.idEmpBird, id2: this.idCc, code, nome: '' },
    });
  }
}
