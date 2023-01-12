import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtualPage } from './atual.page';

const routes: Routes = [
  {
    path: '',
    component: AtualPage
  },
  {
    path: 'lista-itens',
    loadChildren: () => import('./rotas/carrinho/carrinho.module').then( m => m.CarrinhoPageModule)
  },
  {
    path: 'scanner',
    loadChildren: () => import('./rotas/scanner-caixa/scanner-caixa.module').then( m => m.ScannerCaixaPageModule)
  },
  {
    path: 'pagamento',
    loadChildren: () => import('./rotas/pagamento/pagamento.module').then( m => m.PagamentoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AtualPageRoutingModule {}
