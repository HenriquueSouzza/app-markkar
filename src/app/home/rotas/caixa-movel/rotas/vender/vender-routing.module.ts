import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VenderPage } from './vender.page';

const routes: Routes = [
  {
    path: '',
    component: VenderPage
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
  },
  {
    path: '**',
    redirectTo: '/home/caixa-movel/sistema-vendas',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VenderPageRoutingModule {}
