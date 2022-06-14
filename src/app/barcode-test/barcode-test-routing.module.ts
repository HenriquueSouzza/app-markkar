import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BarcodeTestPage } from './barcode-test.page';

const routes: Routes = [
  {
    path: '',
    component: BarcodeTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarcodeTestPageRoutingModule {}
