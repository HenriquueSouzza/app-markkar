import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FaturamentoPageRoutingModule } from './faturamento-routing.module';

import { FaturamentoPage } from './faturamento.page';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FaturamentoPageRoutingModule,
    NgChartsModule
  ],
  declarations: [FaturamentoPage]
})
export class FaturamentoPageModule {}
