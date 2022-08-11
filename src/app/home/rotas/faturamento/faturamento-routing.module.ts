import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FaturamentoPage } from './faturamento.page';

const routes: Routes = [
  {
    path: '',
    component: FaturamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaturamentoPageRoutingModule {}
