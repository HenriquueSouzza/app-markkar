import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VenderPageRoutingModule } from './vender-routing.module';

import { VenderPage } from './vender.page';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwiperModule,
    VenderPageRoutingModule
  ],
  declarations: [VenderPage]
})
export class VenderPageModule {}
