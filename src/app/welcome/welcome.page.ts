/* eslint-disable no-var */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { MenuController, IonicSlides, IonSlides, LoadingController, isPlatform} from '@ionic/angular';
import { Router } from '@angular/router';
import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { StatusBar } from '@capacitor/status-bar';
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  cnpjErr: string;
  err: string;
  colorCnpj: string;
  colorTOKEN: string;

  constructor(private service: LoginService, public loadingController: LoadingController, private storageService: StorageService, private storage: Storage, private menu: MenuController, private router: Router) { }

  @ViewChild('swiper') swiper: SwiperComponent;

    slideNext(){
        this.swiper.swiperRef.slideNext();
      }

    slidePrev(){
      this.swiper.swiperRef.slidePrev();
    }

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    const valCnpj = await this.storage.get('cnpj');
    const valToken = await this.storage.get('token');
    if(valCnpj !== null && valToken !== null){
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
    if(!isPlatform('mobileweb') && isPlatform('android')){
      StatusBar.setBackgroundColor({color: '#141518'});
    }
  }

  resetColor(){
    this.colorTOKEN = null;
    this.colorCnpj = null;
  }

  async enviarLogin(form: NgForm){
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    await loading.present();
    const login = form.value;
    if(login.cnpj.toString().length !== 14){
      await loading.dismiss();
      this.swiper.swiperRef.slidePrev();
      this.cnpjErr = "Digite um CNPJ valido";
      this.colorCnpj = "danger";
    }
    else if(login.token.length === 0){
      await loading.dismiss();
      this.cnpjErr = null;
      this.colorCnpj = null;
      this.colorTOKEN = "danger";
      this.err = "Digite uma senha";
    }
    else{
      this.cnpjErr = null;
      this.colorTOKEN = null;
      this.colorCnpj = null;
      this.service.firstlogin(login).subscribe(async response =>{
        if(response["status"] === "failed"){
          this.colorTOKEN = "danger";
          this.colorCnpj = "danger";
          this.err = "CNPJ ou TOKEN invalido";
          await loading.dismiss();
        }
        else if(response["status"] === "blocked"){
          this.colorTOKEN = "danger";
          this.err = "TOKEN bloqueado";
          await loading.dismiss();
        }
        else if(response["status"] === "success"){
          this.err = null;
          this.colorTOKEN = null;
          this.colorCnpj = null;
          await this.storageService.set("fOpen", false);
          await this.storageService.set("cnpj", login.cnpj);
          await this.storageService.set("token", login.token);
          await this.storageService.set("idToken", response["id_token"]);
          var empresas = await this.storage.get('empresas');
          empresas[response['empresa']] = {
          empresa: response['empresa'],
          cnpj: login.cnpj,
          token: login.token,
          idToken: response['id_token']};
          await this.storage.set('empresas', empresas);
          await this.storage.set('empresaAtual', response['empresa']);
          await loading.dismiss();
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      }, async error => {
        await loading.dismiss();
        this.err = "falha ao conectar com o servidor";
      });
    }
  }
}
