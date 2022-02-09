import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WellcomePagePageRoutingModule } from './wellcome-page-routing.module';

import { WellcomePagePage } from './wellcome-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WellcomePagePageRoutingModule
  ],
  declarations: [WellcomePagePage]
})
export class WellcomePagePageModule {}
