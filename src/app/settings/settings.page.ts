import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController, AlertController, Platform, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { StorageService } from '../servico/storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})



export class SettingsPage implements OnInit {
  name: string;

  constructor(

    private menu: MenuController,
    private router: Router,
    private storage: Storage,
    private storageService: StorageService,
    private platform: Platform,
    private navCtrl: NavController,
    public toastController: ToastController
    ) {
      this.platform.backButton.subscribeWithPriority(10, () => {
        this.enableMenu();
        this.navCtrl.back();
      });
     }

  async ngOnInit() {
    setTimeout(() => {this.menu.enable(false, 'homeMenu');}, 300);
    this.name = await this.storage.get('login');
  }

  enableMenu(){
    this.menu.enable(true, 'homeMenu');
  }

  redirect(){
    this.router.navigateByUrl('/preferences');
  }

  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark'
    });
    toast.present();
  }
}
