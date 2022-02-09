import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WellcomePagePage } from './wellcome-page.page';

const routes: Routes = [
  {
    path: '',
    component: WellcomePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WellcomePagePageRoutingModule {}
