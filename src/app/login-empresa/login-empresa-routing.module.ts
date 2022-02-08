import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginEmpresaPage } from './login-empresa.page';

const routes: Routes = [
  {
    path: '',
    component: LoginEmpresaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginEmpresaPageRoutingModule {}
