import { Component, OnInit } from '@angular/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './services/storage/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{

  constructor(
    private screenOrientation: ScreenOrientation,
    private storage: Storage,
    private storageService: StorageService,
    private navCtrl: NavController,
    ){
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  async ngOnInit(){
    const appConfig = await this.storage.get('appConfig');
    const verificaVersao = await this.storage.get('valUpdateReset');
    if(verificaVersao !== null && verificaVersao !== '1.15.3'){
      await this.storage.clear();
      this.navCtrl.navigateForward('/', { replaceUrl: true });
    } else if(appConfig !== null && appConfig.hasOwnProperty('updateCritico') && appConfig.hasOwnProperty('firstOpen')) {
      if(verificaVersao === null && appConfig.updateCritico !== '1.15.3' && appConfig.firstOpen === false){
        await this.storage.clear();
        this.navCtrl.navigateForward('/', { replaceUrl: true });
      }
    }
  }
}
