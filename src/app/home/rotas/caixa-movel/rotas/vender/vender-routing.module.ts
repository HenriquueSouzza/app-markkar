import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VenderPage } from './vender.page';

const routes: Routes = [
  {
    path: '',
    component: VenderPage
  },
  {
    path: 'configuracoes',
    loadChildren: () => import('./rotas/configuracoes/configuracoes.module').then( m => m.ConfiguracoesPageModule)
  },
  {
    path: 'atual',
    loadChildren: () => import('./rotas/atual/atual.module').then( m => m.AtualPageModule)
  },
  {
    path: 'anteriores',
    loadChildren: () => import('./rotas/anteriores/anteriores.module').then( m => m.AnterioresPageModule)
  },
  {
    path: '**',
    redirectTo: '/home/caixa-movel/sistema-vendas',
    pathMatch: 'full'
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VenderPageRoutingModule {}
