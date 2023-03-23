import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaItensPageRoutingModule } from './lista-itens-routing.module';

import { ListaItensPage } from './lista-itens.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaItensPageRoutingModule
  ],
  declarations: [ListaItensPage]
})
export class ListaItensPageModule {}
