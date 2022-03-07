import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from '../servico/storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})



export class SettingsPage implements OnInit {
  name: string;

  constructor(private menu: MenuController, private storage: Storage, private storageService: StorageService,) { }

  async ngOnInit() {
    setTimeout(() => {this.menu.enable(false, 'homeMenu');}, 400);
    this.name = await this.storage.get('login');
  }

  enableMenu(){
    this.menu.enable(true, 'homeMenu');
  }
}
