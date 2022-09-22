import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
})
export class ConfiguracoesPage implements OnInit {
  name: string;

  constructor(
    private navCtrl: NavController,
    public toastController: ToastController
  ) { }

  ngOnInit() { }

  redirect() {
    this.navCtrl.navigateForward('/home/configuracoes/preferencias');
  }

  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark',
    });
    toast.present();
  }
}
