import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-vender',
  templateUrl: './vender.page.html',
  styleUrls: ['./vender.page.scss'],
})
export class VenderPage implements OnInit {

  constructor(
    public alertController: AlertController,
    private navCtrl: NavController,
    public loadingController: LoadingController,
  ) { }

  ngOnInit() {
  }

  async verificaNovaVenda(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Venda não finalizada',
      message: 'Você deseja voltar a venda ANTERIOR ou iniciar uma NOVA?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'ANTERIOR',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: () => {
            this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/scanner');
          },
        },
        {
          text: 'NOVA',
          id: 'confirm-button',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cancelando venda anterior, aguarde...'
            });
            await loading.present();
            setTimeout(async () => {
              await loading.dismiss();
              this.navCtrl.navigateForward('/home/caixa-movel/sistema-vendas/scanner');
            }, 1000);
          },
        },
      ],
    });
    await alert.present();
  }

}
