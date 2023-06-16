/* eslint-disable @typescript-eslint/dot-notation */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { MenuController, LoadingController, isPlatform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { LoginService } from '../../services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-bem-vindo',
  templateUrl: './bem-vindo.component.html',
  styleUrls: ['./bem-vindo.component.scss'],
})
export class BemVindoComponent implements OnInit {
  cnpjErr: string;
  err: string;
  colorCnpj: string;
  colorTOKEN: string;
  keyHeight = false;
  keyHeightM = false;
  private auth: any;

  constructor(
    public loadingController: LoadingController,
    private service: LoginService,
    private storageService: StorageService,
    private storage: Storage,
    private menu: MenuController,
    private router: Router,
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
  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('swiperContainer') swiperEl: any;


  slideNext() {
    this.swiperEl.nativeElement.swiper.slideNext();
  }

  slidePrev() {
    this.swiperEl.nativeElement.swiper.slidePrev();
  }

  async ngOnInit() {
    this.auth = await this.storage.get('auth');
    if (this.auth.hasOwnProperty('empresa')) {
      const valCnpj = this.auth.empresa.cnpj;
      const valToken = this.auth.empresa.token;
      if (valCnpj !== null && valToken !== null) {
        this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
      }
    }
  }

  resetColor() {
    this.colorTOKEN = null;
    this.colorCnpj = null;
  }

  async enviarLogin(form: NgForm) {
    const loading = await this.loadingController.create({
      message: 'autenticando...',
    });
    await loading.present();
    const login = form.value;
    if (login.cnpj.toString().length !== 14) {
      await loading.dismiss();
      this.swiperEl.nativeElement.swiper.slidePrev();
      this.cnpjErr = 'Digite um CNPJ valido';
      this.colorCnpj = 'danger';
    } else if (login.token.length === 0) {
      await loading.dismiss();
      this.cnpjErr = null;
      this.colorCnpj = null;
      this.colorTOKEN = 'danger';
      this.err = 'Digite uma senha';
    } else {
      this.cnpjErr = null;
      this.colorTOKEN = null;
      this.colorCnpj = null;
      this.service.firstlogin(login).subscribe(
        async (response: any) => {
          if (response.connection['status'] === 'failed') {
            this.colorTOKEN = 'danger';
            this.colorCnpj = 'danger';
            this.err = 'CNPJ ou TOKEN invalido';
            await loading.dismiss();
          } else if (response.connection['status'] === 'blocked') {
            this.colorTOKEN = 'danger';
            this.err = 'TOKEN bloqueado';
            await loading.dismiss();
          } else if (response.connection['status'] === 'success') {
            this.err = null;
            this.colorTOKEN = null;
            this.colorCnpj = null;
            let auth = this.auth;
            if (auth === null) {
              auth = {};
              auth.empresa = {
                cnpj: login.cnpj,
                token: login.token,
                id: response.loginInformation['id_token'],
              };
            } else {
              auth.empresa = {
                cnpj: login.cnpj,
                token: login.token,
                id: response.loginInformation['id_token'],
              };
            }
            await this.storageService.set('auth', auth);
            const multiEmpresa = await this.storage.get('multiEmpresa');
            multiEmpresa.empresas[response.loginInformation['id_token']] = {
              empresa: response.loginInformation['empresa'],
              cnpj: login.cnpj,
              token: login.token,
              idToken: response.loginInformation['id_token'],
              telefone: response.loginInformation['telefone'],
              email: response.loginInformation['email'],
            };
            await this.storage.set('multiEmpresa', multiEmpresa);
            const appConfig = await this.storage.get('appConfig');
            appConfig.firstOpen = false;
            appConfig.empresaAtual = response.loginInformation['empresa'];
            await this.storage.set('appConfig', appConfig);
            await loading.dismiss();
            this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
          }
        },
        async (error) => {
          await loading.dismiss();
          this.err = 'falha ao conectar com o servidor';
        }
      );
    }
  }
}
