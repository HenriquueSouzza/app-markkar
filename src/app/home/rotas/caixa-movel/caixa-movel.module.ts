import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaixaMovelPageRoutingModule } from './caixa-movel-routing.module';

import { CaixaMovelPage } from './caixa-movel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaixaMovelPageRoutingModule
  ],
  declarations: [CaixaMovelPage]
})
export class CaixaMovelPageModule {}
