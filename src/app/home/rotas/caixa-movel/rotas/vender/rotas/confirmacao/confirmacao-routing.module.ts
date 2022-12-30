import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmacaoPage } from './confirmacao.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmacaoPageRoutingModule {}
