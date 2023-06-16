import { UsuarioComponent } from './rotas/usuario/usuario.component';
import { TokenBlockComponent } from './rotas/token-block/token-block.component';
import { EmpresaComponent } from './rotas/empresa/empresa.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { BemVindoComponent } from './rotas/bem-vindo/bem-vindo.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
  ],
  declarations: [
    LoginPage,
    BemVindoComponent,
    EmpresaComponent,
    UsuarioComponent,
    TokenBlockComponent,
  ],
})
export class LoginPageModule {}
