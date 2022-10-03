/* eslint-disable import/no-deprecated */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import {
  isPlatform,
  LoadingController,
  ToastController,
  MenuController,
} from '@ionic/angular';
import {
  BackgroundColorOptions,
  StatusBar,
  StatusBarStyle,
} from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from '../services/storage/storage.service';
import { LoginService } from './services/login/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  btn: string;
  // storage
  private auth: any;
  private faturamentoStorage: any;
  private multiEmpresaStorage: any;
  private appConfigStorage: any;

  constructor(
    private menu: MenuController,
    private router: Router,
    private storage: Storage,
    private storageService: StorageService,
    private service: LoginService,
    public loadingController: LoadingController,
    public toastController: ToastController
  ) {this.btn = 'none';}

  async ngOnInit() {
    // storage
    this.auth = await this.storage.get('auth');
    this.faturamentoStorage = await this.storage.get('faturamento');
    this.multiEmpresaStorage = await this.storage.get('multiEmpresa');
    this.appConfigStorage = await this.storage.get('appConfig');
    // ..
    let auth = this.auth;
    if (auth === null || !this.appConfigStorage.hasOwnProperty('firstOpen') || this.appConfigStorage.firstOpen !== false) {
      const configsFaturamento = {
        unidadesCheck: {},
        configuracoes: {
          grafico: {intervalo: 'lastFourMonths'},
          centrodecustos: {intervalo: 'day'},
          header: {intervalo: 'month'},
          gerais: {
            mask: true,
            cmvPerc: true
          }
        }
      };
      const multiEmpresa = {empresas: {}};
      const appConfig = {updateCritico: '1.15.3'};
      auth = {};
      await this.storage.set('faturamento', configsFaturamento);
      await this.storage.set('multiEmpresa', multiEmpresa);
      await this.storage.set('appConfig', appConfig);
      await this.storage.set('auth', auth);
      this.router.navigateByUrl('/login/bemVindo', { replaceUrl: true });
      setTimeout(() => {
        SplashScreen.hide();
      }, 2000);
    } else {
      const valIntGra = this.faturamentoStorage.configuracoes.grafico.intervalo;
      const valUpdateReset = this.appConfigStorage.updateCritico;
      const valFLogin = this.appConfigStorage.firstOpen;
      const valCnpj = this.auth.empresa.cnpj;
      const valToken = this.auth.empresa.token;
      const valIdToken = this.auth.empresa.id;
      const valLogin = this.auth.usuario.login;
      const valSenhaLogin = this.auth.usuario.senha;
      const validateLogin = {
        user: auth.usuario.login,
        senha: auth.usuario.senha,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_token: auth.empresa.id,
      };
      const validatefLogin = { cnpj: auth.empresa.cnpj, token: auth.empresa.token };
      if (
        valLogin !== null &&
        valSenhaLogin !== null &&
        valIdToken !== null
      ) {
        this.service.login(validateLogin).subscribe(
          async (response: any) => {
            console.log(response);
            if (response.connection['status'] === 'success') {
              this.btn = 'block';
              this.router.navigateByUrl('/home/faturamento', { replaceUrl: true });
              setTimeout(() => {
                SplashScreen.hide();
              }, 2000);
              if (!isPlatform('mobileweb') && isPlatform('android')) {
                const optsBck: BackgroundColorOptions = { color: '#222428' };
                StatusBar.setBackgroundColor(optsBck);
              }
              if (!isPlatform('mobileweb') && isPlatform('ios')) {
                StatusBar.setStyle({ style: StatusBarStyle.Dark });
              }
            } else if (response.connection['status'] === 'failed') {
              this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
              setTimeout(() => {
                SplashScreen.hide();
              }, 2000);
            } else if (response.connection['status'] === 'errDB') {
              this.btn = 'block';
              setTimeout(() => {
                SplashScreen.hide();
              }, 2000);
              this.presentToast('Falha ao conectar com o servidor de dados');
            }
          },
          async (error) => {
            this.btn = 'block';
            setTimeout(() => {
              SplashScreen.hide();
            }, 2000);
            this.presentToast('Falha ao conectar com o servidor');
          }
        );
      } else if (valCnpj !== null && valToken !== null) {
        this.service.firstlogin(validatefLogin).subscribe(
          async (response: any) => {
            if (response.connection['status'] === 'failed') {
              this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
              setTimeout(() => {
                SplashScreen.hide();
              }, 2000);
            } else if (response.connection['status'] === 'blocked') {
              this.router.navigateByUrl('/login/tokenBlock', { replaceUrl: true });
              setTimeout(() => {
                SplashScreen.hide();
              }, 2000);
            } else if (response.connection['status'] === 'success') {
              this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
              setTimeout(() => {
                SplashScreen.hide();
              }, 2000);
            } else if (response.connection['status'] === 'errDB') {
              this.btn = 'block';
              setTimeout(() => {
                SplashScreen.hide();
              }, 2000);
              this.presentToast('Falha ao conectar com o servidor de dados');
            }
          },
          async (error) => {
            this.btn = 'block';
            setTimeout(() => {
              SplashScreen.hide();
            }, 2000);
            this.presentToast('Falha ao conectar com o servidor');
          }
        );
      } else if (
        valCnpj === null ||
        valToken === null ||
        valLogin === null ||
        valSenhaLogin === null ||
        valIdToken === null
      ) {
        this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
        setTimeout(() => {
          SplashScreen.hide();
        }, 2000);
      } else {
        this.btn = 'block';
        setTimeout(() => {
          SplashScreen.hide();
        }, 2000);
        this.presentToast('Falha desconhecida');
      }
    }
  }
  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark',
    });
    toast.present();
  }
}
