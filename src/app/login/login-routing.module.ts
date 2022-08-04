import { BemVindoComponent } from './rotas/bem-vindo/bem-vindo.component';
import { TokenBlockComponent } from './rotas/token-block/token-block.component';
import { UsuarioComponent } from './rotas/usuario/usuario.component';
import { EmpresaComponent } from './rotas/empresa/empresa.component';
import { VerificaTokenGuard } from './../guards/login/verificaToken/verifica-token.guard';
import { VerificaLoginEmpresaGuard } from './../guards/login/verificaLoginEmpresa/verifica-login-empresa.guard';
import { PrimeiroLoginGuard } from './../guards/login/primeiroLogin/primeiro-login.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPage } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  },
  {
    path: 'bemVindo',
    canActivate: [ PrimeiroLoginGuard ],
    component: BemVindoComponent
  },
  {
    path: 'empresa',
    canActivate: [ PrimeiroLoginGuard ],
    component: EmpresaComponent
  },
  {
    path: 'usuario',
    canActivate: [ VerificaLoginEmpresaGuard ],
    component: UsuarioComponent
  },
  {
    path: 'tokenBlock',
    canActivate: [ VerificaTokenGuard ],
    component: TokenBlockComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {}
