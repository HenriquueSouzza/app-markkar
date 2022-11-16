/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { timeout } from 'rxjs/operators';
import { EstoqueService } from './rotas/estoque/services/estoque/estoque.service';

@Component({
  selector: 'app-caixa-movel',
  templateUrl: './caixa-movel.page.html',
  styleUrls: ['./caixa-movel.page.scss'],
})
export class CaixaMovelPage implements OnInit {

  public conectadoServeLocal = false;
  public btnServerLocal = true;
  public centroscustos = [];
  public consultaNome = false;
  public estoqueStorageHist: any;
  public idEmpBird: any;
  public idCcSql: string;
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
    const ccStorage = Object.values(this.multiEmpresaStorage.empresas[this.auth.empresa.id].centrodecustos);
    this.estoqueService
      .consultaCC({ codeEmp: this.idEmpBird })
      .pipe(timeout(5000))
      .subscribe(async (res: any) => {
        for(const cc of res.centrosCustos){
          for(const ccs of ccStorage){
            if(cc.nome === ccs['unidade']){
              this.centroscustos.push({nome: cc.nome, ccIdFb: cc.id, ccIdSql: ccs['idCentroCusto']});
            }
          }
        }
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
              },
            },
          ],
        });
        await alert.present();
      });
  }

  centroscustosChange(cc) {
    if(this.conectadoServeLocal){
      this.idCc = cc.detail.value.fire;
      this.idCcSql = cc.detail.value.sql;
    } else {
      this.idCcSql = cc.detail.value;
    }
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
    if (this.idCcSql === undefined) {
      this.presentToast('Escolha o centro de custo');
    } else {
      this.navCtrl.navigateForward('/home/caixa-movel/relatorios', {
        queryParams: { id: this.idCcSql },
        queryParamsHandling: 'merge',
      });
    }
  }

  navigateEstoque() {
    if (this.idCc === undefined) {
      this.presentToast('Escolha o centro de custo');
    } else {
      this.navCtrl.navigateForward('/home/caixa-movel/estoque', {
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
