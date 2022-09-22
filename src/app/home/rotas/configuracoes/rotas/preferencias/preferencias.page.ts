import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-preferencias',
  templateUrl: './preferencias.page.html',
  styleUrls: ['./preferencias.page.scss'],
})
export class PreferenciasPage implements OnInit {
  valueInterval: string;
  valueGraficoInterval: string;
  mask: boolean;
  cmvPerc: boolean;

  // storage
  private faturamentoStorage: any;

  constructor(
    private storage: Storage,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    this.faturamentoStorage = await this.storage.get('faturamento');
    if (this.faturamentoStorage.configuracoes.header.intervalo === 'on') {
      this.faturamentoStorage.configuracoes.header.intervalo = 'month';
    }
    if (this.faturamentoStorage.configuracoes.grafico.intervalo === 'on') {
      this.faturamentoStorage.configuracoes.grafico.intervalo = 'lastFourMonths';
    }
    if (this.faturamentoStorage.configuracoes.gerais.mask === null) {
      this.faturamentoStorage.configuracoes.gerais.mask = true;
    }
    if (this.faturamentoStorage.configuracoes.gerais.cmvPerc === null) {
      this.faturamentoStorage.configuracoes.gerais.cmvPerc = true;
    }
    this.valueInterval = this.faturamentoStorage.configuracoes.header.intervalo;
    this.valueGraficoInterval = this.faturamentoStorage.configuracoes.grafico.intervalo;
    this.mask = this.faturamentoStorage.configuracoes.gerais.mask;
    this.cmvPerc = this.faturamentoStorage.configuracoes.gerais.cmvPerc;
  }

  async setInterval(event) {
    this.faturamentoStorage.configuracoes.header.intervalo = event.detail.value;
    await this.storage.set('faturamento', this.faturamentoStorage);
  }
  async setMask(event) {
    this.faturamentoStorage.configuracoes.gerais.mask = event.detail.checked;
    await this.storage.set('faturamento', this.faturamentoStorage);
  }
  async setCMV(event) {
    this.faturamentoStorage.configuracoes.gerais.cmvPerc = event.detail.checked;
    await this.storage.set('faturamento', this.faturamentoStorage);
  }
  async setGraficoInterval(event) {
    this.faturamentoStorage.configuracoes.grafico.intervalo = event.detail.value;
    await this.storage.set('faturamento', this.faturamentoStorage);
  }
  blank() {}
}
