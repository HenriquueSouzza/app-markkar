/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EstoqueService } from './services/estoque/estoque.service';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.scss'],
})
export class EstoquePage implements OnInit {
  public centroscustos: Array<any>;
  public consultaNome = false;
  public estoqueStorageHist: any;
  public idEmpBird: any;
  public idCc: string;
  public recentesExist = false;
  private estoqueStorage: any;

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
        await loading.dismiss();
      }, async (error) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Falha ao conectar com o servidor local',
          message: 'Deseja tentar novamente ?',
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
                this.conectServidor();
              },
            },
          ],
        });
        await alert.present();
      });
  }

  async ionViewWillEnter(){
    this.estoqueStorage = await this.storage.get('estoque');
    if (this.estoqueStorage === null){
      await this.storage.set('estoque', {historico: []});
      this.estoqueStorage = await this.storage.get('estoque');
    }
    this.estoqueStorageHist = this.estoqueStorage.historico;
    if(this.estoqueStorageHist.length > 0) {
      this.recentesExist = true;
    } else {
      this.recentesExist = false;
      this.estoqueStorage.historico = {nome: '', codeBar: ''};
    }
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

  async consultarNome(form: NgForm){
    if (this.idCc === undefined) {
      this.presentToast('Escolha o centro de custo');
    } else {
      this.navCtrl.navigateForward('/home/estoque/produtos', {
        queryParams: { id1: this.idEmpBird, id2: this.idCc, code: '', nome: form.value.nomeProd}
      });
    }
  }

  verificaSearchbar(event){
    if(event.detail.value.length > 0){
      this.consultaNome = true;
    } else {
      this.consultaNome = false;
    }
  }

  redirectHist(code){
    if (this.idCc === undefined) {
      this.presentToast('Escolha o centro de custo');
    } else {
      this.navCtrl.navigateForward('/home/estoque/produtos', {
        queryParams: { id1: this.idEmpBird, id2: this.idCc, code, nome: ''}
      });
    }
  }
}
