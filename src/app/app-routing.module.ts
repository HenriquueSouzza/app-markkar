import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'validate-login',
    pathMatch: 'full'
  },
  {
    path: 'login-empresa',
    loadChildren: () => import('./login-empresa/login-empresa.module').then( m => m.LoginEmpresaPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'validate-login',
    loadChildren: () => import('./validate-login/validate-login.module').then( m => m.ValidateLoginPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'preferences',
    loadChildren: () => import('./preferences/preferences.module').then( m => m.PreferencesPageModule)
  },
  {
    path: 'token-block',
    loadChildren: () => import('./token-block/token-block.module').then( m => m.TokenBlockPageModule)
  },
  {
    path: 'barcode-test',
    loadChildren: () => import('./barcode-test/barcode-test.module').then( m => m.BarcodeTestPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
