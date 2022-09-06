import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScannerCaixaPage } from './scanner-caixa.page';

const routes: Routes = [
  {
    path: '',
    component: ScannerCaixaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScannerCaixaPageRoutingModule {}
