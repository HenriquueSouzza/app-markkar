import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ValidateLoginPage } from './validate-login.page';

const routes: Routes = [
  {
    path: '',
    component: ValidateLoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ValidateLoginPageRoutingModule {}
