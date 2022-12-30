import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmacaoPageRoutingModule } from './confirmacao-routing.module';

import { ConfirmacaoPage } from './confirmacao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmacaoPageRoutingModule
  ],
  declarations: [ConfirmacaoPage]
})
export class ConfirmacaoPageModule {}
