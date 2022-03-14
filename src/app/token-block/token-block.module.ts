import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TokenBlockPageRoutingModule } from './token-block-routing.module';

import { TokenBlockPage } from './token-block.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TokenBlockPageRoutingModule
  ],
  declarations: [TokenBlockPage]
})
export class TokenBlockPageModule {}
