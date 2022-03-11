/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { StorageService } from '../servico/storage.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})
export class PreferencesPage implements OnInit {

  valueInterval: string;
  mask: string;
  cmvPerc: string;
  constructor(private menu: MenuController, private router: Router, private storage: Storage, private storageService: StorageService,) { }

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    if(await this.storage.get("intervalHeader") === "on"){await this.storage.set("intervalHeader", "month");}
    if(await this.storage.get("mask") === null){await this.storage.set("mask", true);}
    if(await this.storage.get("cmvPerc") === null){await this.storage.set("cmvPerc", true);}
    this.valueInterval = await this.storage.get("intervalHeader");
    this.mask = await this.storage.get("mask");
    this.cmvPerc = await this.storage.get("cmvPerc");
  }

  async setInterval(event){
    await this.storage.set("intervalHeader", event.detail.value);
  }
  async setMask(event){
    await this.storage.set("mask", event.detail.checked);
  }
  async setCMV(event){
    await this.storage.set("cmvPerc", event.detail.checked);
  }
  blank(){}
}
