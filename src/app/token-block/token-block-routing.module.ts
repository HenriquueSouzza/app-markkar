import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TokenBlockPage } from './token-block.page';

const routes: Routes = [
  {
    path: '',
    component: TokenBlockPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenBlockPageRoutingModule {}
