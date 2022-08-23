/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { EstoqueService } from './services/estoque/estoque.service';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.scss'],
})
export class EstoquePage implements OnInit {
  public centroscustos: Array<any>;
  private idEmpBird: any;
  private idCc: string;

  constructor(
    private estoqueService: EstoqueService,
    private storage: Storage,
    private storageService: StorageService,
    private navCtrl: NavController,
    public toastController: ToastController
  ) {}

  async ngOnInit() {
    this.idEmpBird = await this.storage.get('multiempresa');
    this.idEmpBird = Object.values(
      this.idEmpBird[await this.storage.get('idToken')]
    )[0]['idEmpBird'];
    this.estoqueService
      .consultaCC({ codeEmp: this.idEmpBird })
      .subscribe((res: any) => {
        this.centroscustos = res.centrosCustos;
        console.log(this.centroscustos);
      });
  }

  centroscustosChange(cc) {
    this.idCc = cc.detail.value;
  }

  navigateScanner() {
    if (this.idCc === undefined) {
      this.presentToast('Escolha o centro de custo');
    } else {
      this.navCtrl.navigateForward('/home/estoque/scanner', {
        queryParams: { id1: this.idEmpBird, id2: this.idCc },
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
