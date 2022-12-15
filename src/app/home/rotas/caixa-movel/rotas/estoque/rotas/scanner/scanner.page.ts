import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})
export class ScannerPage implements OnInit {
  public flashIsSwitchedOn = false;
  public telaEspelho = true;
  public telaDigCodigo = false;
  private scanIsRun = false;
  private idCc: string;
  private idEmpBird: any;

  // storage
  private caixaMovelStorage: any;

  constructor(
    public toastController: ToastController,
    private storage: Storage,
    private storageService: StorageService,
    private screenOrientation: ScreenOrientation,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.caixaMovelStorage = await this.storage.get('caixa-movel');
    this.idEmpBird = this.caixaMovelStorage.configuracoes.slectedIds.firebirdIdEmp;
    this.idCc = this.caixaMovelStorage.configuracoes.slectedIds.fireBirdIdCc;

    setTimeout(() => {
      this.telaEspelho = false;
    }, 500);
    this.reloadScan();
  }

  async startScan() {
    this.scanIsRun = true;
    this.screenOrientation.unlock();
    BarcodeScanner.hideBackground(); // make background of WebView transparent
    const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
    // if the result has content
    if (result.hasContent) {
      this.navCtrl.navigateForward('/home/caixa-movel/estoque/produtos', {
        queryParams: { id1: this.idEmpBird, id2: this.idCc, code: result.content, nome: ''}
      });
      //result.content log the raw scanned content
    }
  }

  stopScan() {
    this.scanIsRun = false;
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  }

  reloadScan() {
    this.startScan();
    setTimeout(() => {
      if (this.scanIsRun === true) {
        this.stopScan();
        this.presentToast('Não foi possível ler o código...');
      }
    }, 15000);
  }

  ionViewWillLeave() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.telaEspelho = true;
  }

  switchFlashLight() {
    //this.flashlight.toggle();
    //this.flashIsSwitchedOn = this.flashlight.isSwitchedOn();
  }

  navigateBack() {
    this.stopScan();
    this.telaEspelho = true;
    setTimeout(() => {
      this.navCtrl.navigateBack('/home/caixa-movel/estoque');
    }, 500);
  }

  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark',
    });
    toast.present();
  }

  async consultarProd(form: NgForm){
    this.navCtrl.navigateForward('/home/caixa-movel/estoque/produtos', {
      queryParams: { id1: this.idEmpBird, id2: this.idCc, code: form.value.codeProd, nome: ''}
    });
  }
}
