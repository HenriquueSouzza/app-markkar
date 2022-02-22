/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { Component, OnInit, ViewChild } from '@angular/core';
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';
import { NgForm } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { MenuController } from '@ionic/angular';
import { IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';

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

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    allowTouchMove: false
  };

  constructor(private service: LoginService, public loadingController: LoadingController, private storageService: StorageService, private storage: Storage, private menu: MenuController, private router: Router) { }

  @ViewChild('slider')  slides: IonSlides;

    slideNext(){
        this.slides.slideNext();
      }

    slidePrev(){
      this.slides.slidePrev();
    }

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    const valCnpj = await this.storage.get('cnpj');
    const valToken = await this.storage.get('token');
    if(valCnpj !== null && valToken !== null){
      this.router.navigateByUrl('/login', { replaceUrl: true });
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
    if(login.cnpj.length !== 14){
      await loading.dismiss();
      this.slides.slidePrev();
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
