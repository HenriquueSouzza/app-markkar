import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Dialog } from '@capacitor/dialog';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { StorageService } from '../storage/storage.service';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { isPlatform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ControleVersaoService {

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private router: Router,
    private storageService: StorageService,
    private navCtrl: NavController,
    private appVersion: AppVersion
    ) { }

  async check(){
    if (!isPlatform('mobileweb')) {
      this.http.get('https://api.markkar.com.br/versaoAppControl.json').subscribe(async (res: any) => {
        const versaoAtual = res.versao;
        const versaoApp = await this.appVersion.getVersionCode();
        if(versaoAtual > versaoApp){
          this.router.navigateByUrl('/login/updateApp', { replaceUrl: true });
          this.showDialog();
        } else {
          this.checkReset();
        }
      }, (error) => {
        alert('Erro desconhecido');
      });
    } else {
      this.checkReset();
    }
  }

  async checkReset(){
    const appConfig = await this.storage.get('appConfig');
    const verificaVersao = await this.storage.get('valUpdateReset');
    if(verificaVersao !== null && verificaVersao !== '1.15.3'){
      await this.storage.clear();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } else if(appConfig !== null && appConfig.hasOwnProperty('updateCritico') && appConfig.hasOwnProperty('firstOpen')) {
      if(verificaVersao === null && appConfig.updateCritico !== '1.15.3' && appConfig.firstOpen === false){
        await this.storage.clear();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    }
  }

  async showDialog(){
    await Dialog.alert({
      title: 'Aplicativo Desatualizado',
      message: `Uma nova versão do portal está disponível.`,
      buttonTitle: 'Atualizar'
    });
    this.openStore();
  };

  async openStore() {
    const urlApple = 'https://itunes.apple.com/app/id1469563885';
    const urlAndroid = 'https://play.google.com/store/apps/details?id=br.com.markkar.portal';

    await Browser.open({ url: urlAndroid, toolbarColor: '#222428' });
    await Browser.addListener('browserFinished', () => {
      this.check();
    });
  };
}
