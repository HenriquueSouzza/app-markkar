import { Component, OnInit } from '@angular/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { ControleVersaoService } from './services/controleVersao/controle-versao.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private screenOrientation: ScreenOrientation,
    private controleVersao: ControleVersaoService
    ){
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.controleVersao.check();
  }
}
