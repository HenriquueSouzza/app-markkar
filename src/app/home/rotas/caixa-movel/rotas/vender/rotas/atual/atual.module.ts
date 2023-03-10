import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AtualPageRoutingModule } from './atual-routing.module';

import { AtualPage } from './atual.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AtualPageRoutingModule
  ],
  declarations: [AtualPage]
})
export class AtualPageModule {}
