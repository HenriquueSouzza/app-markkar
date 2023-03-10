import { Component, OnInit } from '@angular/core';
import { isPlatform } from '@ionic/angular';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { ControleVersaoService } from './services/controleVersao/controle-versao.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private controleVersao: ControleVersaoService, private screenOrientation: ScreenOrientation) {
    console.log(isPlatform('mobileweb'));
    if (!isPlatform('mobileweb')) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
    this.controleVersao.check();
  }
}
