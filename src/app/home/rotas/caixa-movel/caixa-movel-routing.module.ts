import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaixaMovelPage } from './caixa-movel.page';

const routes: Routes = [
  {
    path: '',
    component: CaixaMovelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaixaMovelPageRoutingModule {}