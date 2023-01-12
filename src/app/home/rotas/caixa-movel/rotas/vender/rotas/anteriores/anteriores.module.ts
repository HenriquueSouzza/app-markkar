import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnterioresPageRoutingModule } from './anteriores-routing.module';

import { AnterioresPage } from './anteriores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnterioresPageRoutingModule
  ],
  declarations: [AnterioresPage]
})
export class AnterioresPageModule {}
