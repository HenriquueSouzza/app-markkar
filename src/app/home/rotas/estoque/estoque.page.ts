import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { EstoqueService } from '../../services/estoque/estoque.service';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.scss'],
})
export class EstoquePage implements OnInit {

  constructor(private screenOrientation: ScreenOrientation, private estoqueService: EstoqueService) { }

  ngOnInit() {
    this.estoqueService.estoque({code: '7899838806976'}).subscribe( (res: any) => {
    });
    const startScan = async () => {
      this.screenOrientation.unlock();
      BarcodeScanner.hideBackground(); // make background of WebView transparent
      const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
      // if the result has content
      if (result.hasContent) {
        //alert('teste'+result.content); // log the raw scanned content
        this.estoqueService.estoque({code: result.content}).subscribe( (res: any) => {
          alert(res.produtos[0].NOME_PRODUTO);
          //{COD_BARRA: "7899838806976" COD_PRODUTO: "4371" NOME_PRODUTO: "TESTE HENRIQUE" QTD_ESTOQUE: "50" UNIDADE: "UN" VALOR: "5"}
        });
      }
    };
    const stopScan = () => {
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
    };
    startScan();
    setTimeout(() => {
      stopScan();
    }, 20000);
  }

  ionViewWillLeave(){
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }
}
