import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FechamentoCaixaPage } from './fechamento-caixa.page';

const routes: Routes = [
  {
    path: '',
    component: FechamentoCaixaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FechamentoCaixaPageRoutingModule {}
