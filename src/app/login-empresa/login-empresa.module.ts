import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginEmpresaPageRoutingModule } from './login-empresa-routing.module';

import { LoginEmpresaPage } from './login-empresa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginEmpresaPageRoutingModule
  ],
  declarations: [LoginEmpresaPage]
})
export class LoginEmpresaPageModule {}
