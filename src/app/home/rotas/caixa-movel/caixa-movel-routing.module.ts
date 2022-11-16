import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaixaMovelPage } from './caixa-movel.page';

const routes: Routes = [
  {
    path: '',
    component: CaixaMovelPage
  },
  {
    path: 'relatorios',
    loadChildren: () => import('./rotas/relatorios/relatorios.module').then( m => m.RelatoriosPageModule)
  },
  {
    path: 'sistema-vendas',
    loadChildren: () => import('./rotas/vender/vender.module').then( m => m.VenderPageModule)
  },
  {
    path: 'estoque',
    loadChildren: () => import('./rotas/estoque/estoque.module').then( m => m.EstoquePageModule)
  },
  {
    path: '**',
    redirectTo: '/home/caixa-movel',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaixaMovelPageRoutingModule {}
