/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  AlertController,
  isPlatform,
  LoadingController,
  NavController,
  Platform,
} from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { LoginService } from '../../services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss'],
})
export class UsuarioComponent implements OnInit {
  empAtual: string;
  colorInput = 'var(--ion-text-color)';
  keyHeight = false;
  keyHeightM = false;
  errLogin: string;
  private auth: any;

  constructor(
    private menu: MenuController,
    private service: LoginService,
    public loadingController: LoadingController,
    private storage: Storage,
    private storageService: StorageService,
    private router: Router,
    private navCtrl: NavController,
    public alertController: AlertController,
    private platform: Platform
  ) {
    this.platform.keyboardDidShow.subscribe((ev) => {
      const { keyboardHeight } = ev;
      if (!isPlatform('ios')) {
        if (platform.height() <= 500) {
          this.keyHeight = true;
        } else if (platform.height() <= 690) {
          this.keyHeightM = true;
        }
      }
    });
    this.platform.keyboardDidHide.subscribe((ev) => {
      this.keyHeight = false;
      this.keyHeightM = false;
    });
  }

  async ngOnInit() {
    const appConfig = await this.storage.get('appConfig');
    this.auth = await this.storage.get('auth');
    this.empAtual = appConfig.empresaAtual;
    if (this.auth.hasOwnProperty('usuario')) {
      const login = this.auth.usuario.login;
      const valIdToken = this.auth.empresa.id;
      const valLogin = this.auth.usuario.login;
      const valTokenUser = this.auth.usuario.token;
      const valLogins = {
        user: valLogin,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_token: valIdToken,
        cnpj: this.auth.empresa.cnpj,
      };
      if (
        valIdToken !== null &&
        valLogin !== null &&
        valTokenUser !== null &&
        valIdToken !== undefined &&
        valLogin !== undefined &&
        valTokenUser !== undefined
      ) {
        this.service.vAtapp(valTokenUser).subscribe(
          async (response: any) => {
            if (response.connection['status'] === 'success') {
              this.errLogin = null;
              const alert = await this.alertController.create({
                cssClass: 'my-custom-class',
                header: 'Você já possui uma sessão aberta.',
                message:
                  'Deseja retornar com' + ' ' + login.toUpperCase() + ' ' + '?',
                buttons: [
                  {
                    text: 'NÃO',
                    role: 'cancel',
                    cssClass: 'secondary',
                    id: 'cancel-button',
                    handler: () => {
                      // navigator['app'].exitApp();
                    },
                  },
                  {
                    text: 'SIM',
                    id: 'confirm-button',
                    handler: async () => {
                      this.router.navigateByUrl('/home/faturamento', {
                        replaceUrl: true,
                      });
                    },
                  },
                ],
              });
              await alert.present();
            } else if (response.connection['status'] === 'errDB') {
              this.errLogin =
                'Não foi possivel conectar com o servidor de dados';
            }
          },
          async (error) => {
            this.errLogin = 'falha ao conectar com o servidor';
          }
        );
      }
    }
  }
  change() {
    this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
  }
  async enviarLogin(form: NgForm) {
    this.errLogin = null;
    const loading = await this.loadingController.create({
      message: 'autenticando...',
    });
    await loading.present();
    const login = form.value;
    if (login.user.length === 0) {
      await loading.dismiss();
      this.errLogin = 'Digite um usuario';
    } else if (login.senha.length === 0) {
      await loading.dismiss();
      this.errLogin = 'Digite uma senha';
    } else {
      login.user = login.user.trim();
      login.id_token = this.auth.empresa.id;
      login.cnpj = this.auth.empresa.cnpj;
      this.service.login(login).subscribe(
        async (response: any) => {
          if (response.connection['status'] === 'success') {
            this.errLogin = null;
            if (this.auth === null) {
              this.auth = {};
              this.auth.usuario = {
                login: login.user,
                token: response.token,
                idFireBird: response.idFire
              };
            } else {
              this.auth.usuario = {
                login: login.user,
                token: response.token,
                idFireBird: response.idFire
              };
            }
            await this.storage.set('auth', this.auth);
            await loading.dismiss();
            this.router.navigateByUrl('/home/faturamento', {
              replaceUrl: true,
            });
          } else if (response.connection['status'] === 'failed') {
            this.colorInput = 'red';
            this.errLogin = 'Login ou Senha não encontrados';
            await loading.dismiss();
          } else if (response.connection['status'] === 'errDB') {
            this.errLogin = 'Não foi possivel conectar com o servidor de dados';
            await loading.dismiss();
          }
        },
        async (error) => {
          await loading.dismiss();
          this.errLogin = 'falha ao conectar com o servidor';
        }
      );
    }
  }
  colorReset() {
    this.colorInput = 'var(--ion-text-color)';
  }
}
