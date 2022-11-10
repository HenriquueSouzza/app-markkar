/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { timeout } from 'rxjs/operators';
import { EstoqueService } from '../estoque/services/estoque/estoque.service';

@Component({
  selector: 'app-caixa-movel',
  templateUrl: './caixa-movel.page.html',
  styleUrls: ['./caixa-movel.page.scss'],
})
export class CaixaMovelPage implements OnInit {

  public conectadoServeLocal = false;
  public btnServerLocal = true;
  public centroscustos: Array<any>;
  public consultaNome = false;
  public estoqueStorageHist: any;
  public idEmpBird: any;
  public idCc: string;
  public recentesExist = false;

  // storage
  private auth: any;
  private multiEmpresaStorage: any;

  constructor(
    private estoqueService: EstoqueService,
    private storage: Storage,
    private storageService: StorageService,
    private navCtrl: NavController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public toastController: ToastController
  ) {}

  async ngOnInit() {
    this.auth = await this.storage.get('auth');
    this.multiEmpresaStorage = await this.storage.get('multiEmpresa');
    if(await this.storage.get('caixa-movel') === null){
      await this.storage.set('caixa-movel', {vendas: {carrinho: [], configuracoes: { modoRapido: false }}});
    };
    this.conectServidor();
  }

  async conectServidor(){
    const loading = await this.loadingController.create({
      message: 'Conectando ao servidor local, aguarde...'
    });
    await loading.present();
    this.idEmpBird = Object.values(this.multiEmpresaStorage.empresas[this.auth.empresa.id].centrodecustos)[0]['idEmpBird'];
    this.estoqueService
      .consultaCC({ codeEmp: this.idEmpBird })
      .pipe(timeout(5000))
      .subscribe(async (res: any) => {
        this.centroscustos = res.centrosCustos;
        this.btnServerLocal = false;
        this.conectadoServeLocal = true;
        await loading.dismiss();
      }, async (error) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Falha ao conectar com o servidor local',
          message: 'Algumas funcionalidades ficarão desativadas. <br> <br> Deseja continuar ?',
          backdropDismiss: false,
          buttons: [
            {
              text: 'voltar',
              role: 'cancel',
              cssClass: 'secondary',
              id: 'cancel-button',
              handler: () => {
                this.navCtrl.navigateBack('/home/faturamento');
              },
            },
            {
              text: 'SIM',
              id: 'confirm-button',
              handler: () => {
                this.centroscustos = Object.values(this.multiEmpresaStorage.empresas[this.auth.empresa.id].centrodecustos);
                //this.conectServidor();
              },
            },
          ],
        });
        await alert.present();
      });
  }

  centroscustosChange(cc) {
    this.idCc = cc.detail.value;
  }

  navigateScanner() {
    if (this.idCc === undefined) {
      this.presentToast('Escolha o centro de custo');
    } else {
      this.navCtrl.navigateForward('/home/caixa-movel/scanner-caixa', {
        queryParams: { id1: this.idEmpBird, id2: this.idCc },
        queryParamsHandling: 'merge',
      });
    }
  }

  navigateRelatorios() {
    if (this.idCc === undefined) {
      this.presentToast('Escolha o centro de custo');
    } else {
      this.navCtrl.navigateForward('/home/caixa-movel/relatorios', {
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
