import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaItensPage } from './lista-itens.page';

const routes: Routes = [
  {
    path: '',
    component: ListaItensPage
  },
  {
    path: 'scanner',
    loadChildren: () => import('./rotas/scanner-caixa/scanner-caixa.module').then( m => m.ScannerCaixaPageModule)
  },
  {
    path: 'estoque',
    loadChildren: () => import('./rotas/estoque/estoque.module').then( m => m.EstoquePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaItensPageRoutingModule {}
