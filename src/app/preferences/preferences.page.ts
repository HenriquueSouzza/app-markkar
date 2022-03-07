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

  constructor(private menu: MenuController, private router: Router, private storage: Storage, private storageService: StorageService,) { }

  ngOnInit() {
    this.menu.enable(false, 'homeMenu');
  }

}
