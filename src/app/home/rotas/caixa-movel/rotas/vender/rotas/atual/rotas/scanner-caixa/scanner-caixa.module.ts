import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScannerCaixaPageRoutingModule } from './scanner-caixa-routing.module';

import { ScannerCaixaPage } from './scanner-caixa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScannerCaixaPageRoutingModule
  ],
  declarations: [ScannerCaixaPage]
})
export class ScannerCaixaPageModule {}
