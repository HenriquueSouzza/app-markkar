import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfiguracoesPage } from './configuracoes.page';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracoesPage
  },
  {
    path: 'preferencias',
    loadChildren: () => import('./rotas/preferencias/preferencias.module').then( m => m.PreferenciasPageModule)
  },
  {
    path: '**',
    redirectTo: '/home/configuracoes',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracoesPageRoutingModule {}
