import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.scss'],
})
export class EstoquePage implements OnInit {

  constructor() { }

  ngOnInit() {
    const startScan = async () => {
      BarcodeScanner.hideBackground(); // make background of WebView transparent
      const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
      // if the result has content
      if (result.hasContent) {
        alert('teste'+result.content); // log the raw scanned content
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
}
