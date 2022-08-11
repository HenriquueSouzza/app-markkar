import { Component, OnInit } from '@angular/core';
import {
  LoadingController,
  MenuController,
  AlertController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
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

  constructor(
    private menu: MenuController,
    private router: Router,
    private storage: Storage,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    if ((await this.storage.get('intervalHeader')) === 'on') {
      await this.storage.set('intervalHeader', 'month');
    }
    if ((await this.storage.get('intervalGrafico')) === 'on') {
      await this.storage.set('intervalGrafico', 'lastFourMonths');
    }
    if ((await this.storage.get('mask')) === null) {
      await this.storage.set('mask', true);
    }
    if ((await this.storage.get('cmvPerc')) === null) {
      await this.storage.set('cmvPerc', true);
    }
    this.valueInterval = await this.storage.get('intervalHeader');
    this.valueGraficoInterval = await this.storage.get('intervalGrafico');
    this.mask = await this.storage.get('mask');
    this.cmvPerc = await this.storage.get('cmvPerc');
  }

  async setInterval(event) {
    await this.storage.set('intervalHeader', event.detail.value);
  }
  async setMask(event) {
    await this.storage.set('mask', event.detail.checked);
  }
  async setCMV(event) {
    await this.storage.set('cmvPerc', event.detail.checked);
  }
  async setGraficoInterval(event) {
    await this.storage.set('intervalGrafico', event.detail.value);
  }
  blank() {}
}
