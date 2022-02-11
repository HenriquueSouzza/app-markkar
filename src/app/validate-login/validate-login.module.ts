import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ValidateLoginPageRoutingModule } from './validate-login-routing.module';

import { ValidateLoginPage } from './validate-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ValidateLoginPageRoutingModule
  ],
  declarations: [ValidateLoginPage]
})
export class ValidateLoginPageModule {}
