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
    path: 'scanner-caixa',
    loadChildren: () => import('./rotas/scanner-caixa/scanner-caixa.module').then( m => m.ScannerCaixaPageModule)
  },
  {
    path: 'produtos',
    loadChildren: () => import('./rotas/produtos/produtos.module').then( m => m.ProdutosPageModule)
  },
  {
    path: '**',
    redirectTo: '/home/caixa-movel',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaixaMovelPageRoutingModule {}
