import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VenderPage } from './vender.page';

const routes: Routes = [
  {
    path: '',
    component: VenderPage
  },
  {
    path: 'carrinho',
    loadChildren: () => import('./rotas/carrinho/carrinho.module').then( m => m.CarrinhoPageModule)
  },
  {
    path: 'scanner-caixa',
    loadChildren: () => import('./rotas/scanner-caixa/scanner-caixa.module').then( m => m.ScannerCaixaPageModule)
  },
  {
    path: 'produtos',
    loadChildren: () => import('./rotas/produtos/produtos.module').then( m => m.ProdutosPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VenderPageRoutingModule {}
