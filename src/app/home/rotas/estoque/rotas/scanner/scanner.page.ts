import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { EstoqueService } from '../../services/estoque/estoque.service';

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

  constructor(
    private screenOrientation: ScreenOrientation,
    private estoqueService: EstoqueService,
    private flashlight: Flashlight,
    public toastController: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
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
      //alert('teste'+result.content); // log the raw scanned content
      this.estoqueService
        .estoque({ code: result.content })
        .subscribe((res: any) => {
          alert(res.produtos[0].NOME_PRODUTO);
          //{COD_BARRA: "7899838806976" COD_PRODUTO: "4371" NOME_PRODUTO: "TESTE HENRIQUE" QTD_ESTOQUE: "50" UNIDADE: "UN" VALOR: "5"}
        });
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
      if(this.scanIsRun === true){
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
