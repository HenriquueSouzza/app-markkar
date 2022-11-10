import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
})
export class RelatoriosPage implements OnInit {

  private idCc: string;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params: any) => {
      if (params) {
        this.idCc = params.params.id;
      }
    });
  }

  navigateFechamentoCaixa() {
    if (this.idCc === undefined) {
      this.navCtrl.navigateBack('/home/caixa-movel');
      this.presentToast('Escolha o centro de custo');
    } else {
      this.navCtrl.navigateForward('/home/caixa-movel/relatorios/fechamento-caixa', {
        queryParams: { id: this.idCc },
        queryParamsHandling: 'merge',
      });
    }
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
