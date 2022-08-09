import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TokenBlockGuard } from './guards/tokenBlock/token-block.guard';
import { UsuarioGuard } from './guards/usuario/usuario.guard';
import { EmpresaGuard } from './guards/empresa/empresa.guard';
import { BemVindoGuard } from './guards/bemVindo/bem-vindo.guard';
import { BemVindoComponent } from './rotas/bem-vindo/bem-vindo.component';
import { TokenBlockComponent } from './rotas/token-block/token-block.component';
import { UsuarioComponent } from './rotas/usuario/usuario.component';
import { EmpresaComponent } from './rotas/empresa/empresa.component';

import { LoginPage } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  },
  {
    path: 'bemVindo',
    canActivate: [ BemVindoGuard ],
    component: BemVindoComponent
  },
  {
    path: 'empresa',
    canActivate: [ EmpresaGuard ],
    component: EmpresaComponent
  },
  {
    path: 'usuario',
    canActivate: [ UsuarioGuard ],
    component: UsuarioComponent
  },
  {
    path: 'tokenBlock',
    canActivate: [ TokenBlockGuard ],
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
