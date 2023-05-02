import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtualPage } from './atual.page';

const routes: Routes = [
  {
    path: '',
    component: AtualPage
  },
  {
    path: 'pagamento',
    loadChildren: () => import('./rotas/pagamento/pagamento.module').then( m => m.PagamentoPageModule)
  },
  {
    path: 'lista-itens',
    loadChildren: () => import('./rotas/lista-itens/lista-itens.module').then( m => m.ListaItensPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AtualPageRoutingModule {}
