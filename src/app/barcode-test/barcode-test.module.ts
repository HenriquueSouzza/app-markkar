import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BarcodeTestPageRoutingModule } from './barcode-test-routing.module';

import { BarcodeTestPage } from './barcode-test.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BarcodeTestPageRoutingModule
  ],
  declarations: [BarcodeTestPage]
})
export class BarcodeTestPageModule {}
