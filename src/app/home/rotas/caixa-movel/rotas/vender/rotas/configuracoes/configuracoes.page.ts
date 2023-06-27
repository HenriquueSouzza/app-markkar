import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { EstoqueService } from '../../../estoque/services/estoque/estoque.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
})
export class ConfiguracoesPage implements OnInit {
  public ipServidorLocal: any;
  public isConected: any = 'Conectando...';
  public fastMode: any = false;
  public scan: any = false;
  public outStock: any = false;
  private idEmpBird: any;
  private idCc: string;
  private caixaMovelStorage: any;

  constructor(
    private storage: Storage,
    private storageService: StorageService,
    private estoqueService: EstoqueService,
  ) {}

  ngOnInit() { }

  async ionViewDidEnter() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.idEmpBird =
      this.caixaMovelStorage.configuracoes.slectedIds.firebirdIdEmp;
    this.idCc = this.caixaMovelStorage.configuracoes.slectedIds.fireBirdIdCc;
    this.storageService.getIpServidorLocal().then((ip) => {
      this.ipServidorLocal = ip;
      this.estoqueService
        .consultaProduto(
          {
            codeEmp: this.idEmpBird,
            codeCC: this.idCc,
            codeBar: '',
            nome: 'teste',
          },
          ip
        )
        .subscribe({
          next: (response: any) => {
            this.isConected = 'Conectado';
          },
          error: async (err) => {
            this.isConected = 'Erro ao tentar comunicar com o servidor local.';
          },
        });
    });
  }

  /* Toggles */

  async setFastMode(event) {
    console.log('setFastMode', event.detail.checked);
  }

  async setScan(event) {
    console.log('setScan', event.detail.checked);
  }

  async setOutStock(event) {
    console.log('setOutStock', event.detail.checked);
  }
}
