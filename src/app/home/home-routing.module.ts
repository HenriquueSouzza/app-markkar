import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home/faturamento',
    pathMatch: 'full'
  },
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'faturamento',
        loadChildren: () => import('./rotas/faturamento/faturamento.module').then( m => m.FaturamentoPageModule)
      },
      {
        path: 'configuracoes',
        loadChildren: () => import('./rotas/configuracoes/configuracoes.module').then( m => m.ConfiguracoesPageModule)
      }
    ]
  },
  {
    path: 'caixa-movel',
    loadChildren: () => import('./rotas/caixa-movel/caixa-movel.module').then( m => m.CaixaMovelPageModule)
  },
  {
    path: 'estoque',
    loadChildren: () => import('./rotas/estoque/estoque.module').then( m => m.EstoquePageModule)
  },
  {
    path: '**',
    redirectTo: '/home/faturamento',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
