/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { StorageService } from './../servico/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private menu: MenuController, private storage: Storage, private storageService: StorageService, private router: Router, public alertController: AlertController) { }

  ngOnInit() {
    this.menu.enable(true, 'homeMenu');
  }

  async logOut(): Promise<void>{
    await this.storage.remove("login");
    await this.storage.remove("senhaLogin");
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Desconectar',
      message: 'Você realmente deseja desconectar da sua conta ?',
      buttons: [
        {
          text: 'NÃO',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button'
        }, {
          text: 'SIM',
          id: 'confirm-button',
          handler: () => {
            this.logOut();
          }
        }
      ]
    });
    await alert.present();
  }
}
