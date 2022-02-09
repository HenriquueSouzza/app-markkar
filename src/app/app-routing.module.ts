import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login-empresa',
    pathMatch: 'full'
  },
  {
    path: 'login-empresa',
    loadChildren: () => import('./login-empresa/login-empresa.module').then( m => m.LoginEmpresaPageModule)
  },
  {
    path: 'wellcome-page',
    loadChildren: () => import('./wellcome-page/wellcome-page.module').then( m => m.WellcomePagePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
