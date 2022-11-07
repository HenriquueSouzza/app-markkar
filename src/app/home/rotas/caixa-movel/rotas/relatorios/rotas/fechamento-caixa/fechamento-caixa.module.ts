import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FechamentoCaixaPageRoutingModule } from './fechamento-caixa-routing.module';

import { FechamentoCaixaPage } from './fechamento-caixa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FechamentoCaixaPageRoutingModule
  ],
  declarations: [FechamentoCaixaPage]
})
export class FechamentoCaixaPageModule {}
