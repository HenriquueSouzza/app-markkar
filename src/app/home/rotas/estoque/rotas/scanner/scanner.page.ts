import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { EstoqueService } from '../../services/estoque/estoque.service';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private screenOrientation: ScreenOrientation,
    private estoqueService: EstoqueService,
    private flashlight: Flashlight,
    public toastController: ToastController,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params: any) => {
      if (params) {
        this.idEmpBird = params.params.id1;
        this.idCc = params.params.id2;
      }
    });

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
      this.navCtrl.navigateForward('/home/estoque/produtos', {
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
      this.navCtrl.navigateBack('/home/estoque');
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
}
