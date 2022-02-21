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
  colorID: string;

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
    const valFCNPJ = await this.storage.get('fCNPJ');
    const valFSenha = await this.storage.get('fSenha');
    if(valFCNPJ !== null && valFSenha !== null){
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  resetColor(){
    this.colorID = null;
    this.colorCnpj = null;
  }

  async enviarLogin(form: NgForm){
    const loading = await this.loadingController.create({
      message: 'autenticando...'
    });
    await loading.present();
    const login = form.value;
    if(login.cnpj.length === 14){
      await loading.dismiss();
      this.slides.slidePrev();
      this.cnpjErr = "Digite um CNPJ valido";
      this.colorCnpj = "danger";
    }
    else if(login.senha.length === 0){
      await loading.dismiss();
      this.cnpjErr = null;
      this.colorCnpj = null;
      this.colorID = "danger";
      this.err = "Digite uma senha";
    }
    else{
      this.cnpjErr = null;
      this.colorID = null;
      this.colorCnpj = null;
      this.service.firstlogin(login).subscribe(async response =>{
        console.log("response: ",response);
        if(response["dataBase"] == null){
          this.err = "CNPJ ou Senha não encontrados";
          this.colorID = "danger";
          this.colorCnpj = "danger";
          await loading.dismiss();
        }
        else{
          this.err = null;
          this.colorID = null;
          this.colorCnpj = null;
          await this.storageService.set("dataBase", response["dataBase"]);
          await this.storageService.set("fCNPJ", login.cnpj);
          await this.storageService.set("fSenha", login.senha);
          await this.storageService.set("fOpen", false);
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
