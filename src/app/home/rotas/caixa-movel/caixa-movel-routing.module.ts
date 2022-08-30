import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaixaMovelPage } from './caixa-movel.page';

const routes: Routes = [
  {
    path: '',
    component: CaixaMovelPage
  },
  {
    path: 'carrinho',
    loadChildren: () => import('./rotas/carrinho/carrinho.module').then( m => m.CarrinhoPageModule)
  },
  {
    path: 'scanner',
    loadChildren: () => import('./rotas/scanner/scanner.module').then( m => m.ScannerPageModule)
  },
  {
    path: 'produtos',
    loadChildren: () => import('./rotas/produtos/produtos.module').then( m => m.ProdutosPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaixaMovelPageRoutingModule {}
