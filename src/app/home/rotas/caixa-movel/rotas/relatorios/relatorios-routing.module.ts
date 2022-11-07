import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RelatoriosPage } from './relatorios.page';

const routes: Routes = [
  {
    path: '',
    component: RelatoriosPage
  },
  {
    path: 'fechamento-caixa',
    loadChildren: () => import('./rotas/fechamento-caixa/fechamento-caixa.module').then( m => m.FechamentoCaixaPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RelatoriosPageRoutingModule {}
