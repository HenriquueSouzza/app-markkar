import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstoquePage } from './estoque.page';

const routes: Routes = [
  {
    path: '',
    component: EstoquePage
  },
  {
    path: 'scanner',
    loadChildren: () => import('./rotas/scanner/scanner.module').then( m => m.ScannerPageModule)
  },
  {
    path: 'produtos',
    loadChildren: () => import('./rotas/produtos/produtos.module').then( m => m.ProdutosPageModule)
  },
  {
    path: '**',
    redirectTo: '/home/estoque',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstoquePageRoutingModule {}
