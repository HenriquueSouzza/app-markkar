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
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';

@Component({
  selector: 'app-validate-login',
  templateUrl: './validate-login.page.html',
  styleUrls: ['./validate-login.page.scss'],
})
export class ValidateLoginPage implements OnInit {
  btn: string;

  constructor(
    private menu: MenuController,
    private router: Router,
    private storage: Storage,
    private storageService: StorageService,
    private service: LoginService,
    public loadingController: LoadingController,
    public toastController: ToastController
  ) {}

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    this.btn = 'none';
    const valIntGra = await this.storage.get('intervalGrafico');
    const valUpdateReset = await this.storage.get('valUpdateReset');
    const valFLogin = await this.storage.get('fOpen');
    const valCnpj = await this.storage.get('cnpj');
    const valToken = await this.storage.get('token');
    const valIdToken = await this.storage.get('idToken');
    const valLogin = await this.storage.get('login');
    const valSenhaLogin = await this.storage.get('senha');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const validateLogin = {
      user: valLogin,
      senha: valSenhaLogin,
      id_token: valIdToken,
    };
    const validatefLogin = { cnpj: valCnpj, token: valToken };
    if (valFLogin !== false) {
      await this.storage.set('intervalHeader', 'month');
      await this.storage.set('intervalGrafico', 'lastFourMonths');
      await this.storage.set('interval', 'day');
      await this.storage.set('mask', true);
      await this.storage.set('cmvPerc', true);
      await this.storage.set('empresas', {});
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
      setTimeout(() => {
        SplashScreen.hide();
      }, 600);
    } else if (valUpdateReset !== '1.12.36') {
      await this.storage.set('empresas', {});
      await this.storage.set('unidadesCheck', {});
      await this.storage.set('multiempresa', {});
      await this.storageService.set('cnpj', null);
      await this.storageService.set('token', null);
      await this.storageService.set('idToken', null);
      await this.storageService.set('empresaAtual', null);
      await this.storage.set('valUpdateReset', '1.12.36');
      this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
      setTimeout(() => {
        SplashScreen.hide();
      }, 600);
    } else if (valIntGra !== 'lastFourMonths' && valIntGra !== 'fourMonths') {
      await this.storage.set('intervalGrafico', 'lastFourMonths');
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    } else if (
      valLogin !== null &&
      valSenhaLogin !== null &&
      valIdToken !== null
    ) {
      this.service.login(validateLogin).subscribe(
        async (response) => {
          if (response['status'] === 'success') {
            this.btn = 'block';
            this.router.navigateByUrl('/home', { replaceUrl: true });
            setTimeout(() => {
              SplashScreen.hide();
            }, 600);
            if (!isPlatform('mobileweb') && isPlatform('android')) {
              const optsBck: BackgroundColorOptions = { color: '#222428' };
              StatusBar.setBackgroundColor(optsBck);
            }
            if (!isPlatform('mobileweb') && isPlatform('ios')) {
              StatusBar.setStyle({ style: StatusBarStyle.Dark });
            }
          } else if (response['status'] === 'failed') {
            this.router.navigateByUrl('/login', { replaceUrl: true });
            setTimeout(() => {
              SplashScreen.hide();
            }, 600);
          } else if (response['status'] === 'errDB') {
            this.btn = 'block';
            setTimeout(() => {
              SplashScreen.hide();
            }, 600);
            this.presentToast('Falha ao conectar com o servidor de dados');
          }
        },
        async (error) => {
          this.btn = 'block';
          setTimeout(() => {
            SplashScreen.hide();
          }, 600);
          this.presentToast('Falha ao conectar com o servidor');
        }
      );
    } else if (valCnpj !== null && valToken !== null) {
      this.service.firstlogin(validatefLogin).subscribe(
        async (response) => {
          if (response['status'] === 'failed') {
            this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
            setTimeout(() => {
              SplashScreen.hide();
            }, 600);
          } else if (response['status'] === 'blocked') {
            this.router.navigateByUrl('/token-block', { replaceUrl: true });
            setTimeout(() => {
              SplashScreen.hide();
            }, 600);
          } else if (response['status'] === 'success') {
            this.router.navigateByUrl('/login', { replaceUrl: true });
            setTimeout(() => {
              SplashScreen.hide();
            }, 600);
          } else if (response['status'] === 'errDB') {
            this.btn = 'block';
            setTimeout(() => {
              SplashScreen.hide();
            }, 600);
            this.presentToast('Falha ao conectar com o servidor de dados');
          }
        },
        async (error) => {
          this.btn = 'block';
          setTimeout(() => {
            SplashScreen.hide();
          }, 600);
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
      this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
      setTimeout(() => {
        SplashScreen.hide();
      }, 600);
    } else {
      this.btn = 'block';
      setTimeout(() => {
        SplashScreen.hide();
      }, 600);
      this.presentToast('Falha desconhecida');
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
