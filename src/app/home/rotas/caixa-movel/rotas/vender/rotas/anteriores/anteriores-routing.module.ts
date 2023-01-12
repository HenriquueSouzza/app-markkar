import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnterioresPage } from './anteriores.page';

const routes: Routes = [
  {
    path: '',
    component: AnterioresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnterioresPageRoutingModule {}
