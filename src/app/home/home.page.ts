/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';
import { LojasService } from '../servico/lojas.service';
import { format, parseISO } from 'date-fns';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  contentLoader: boolean;
  dateLoader: boolean;
  unidades: string[];
  unidadesHeader: string[];
  somaAllFatTotal: string;
  somaAllMargemTotal: string;
  totalLiquido: string;
  somaFatTotal: string;
  somaMargemTotal: string;
  maxDate: any = format(parseISO(new Date().toISOString()),"yyyy-MM-dd");
  dateValue: any;
  valFLogin: boolean;
  valCnpj: string;
  valToken: string;
  valIdToken: string;
  valLogin: string;
  valSenhaLogin: string;

  constructor(private Lojas: LojasService, private service: LoginService, public loadingController: LoadingController, private menu: MenuController, private storage: Storage, private storageService: StorageService, private router: Router, public alertController: AlertController) { }

  async ngOnInit() {
    this.menu.enable(true, 'homeMenu');
    this.dateLoader = true
    this.contentLoader = false;
    await this.storage.set("date", this.maxDate);
    this.dateValue = await this.storage.get("date");
    this.valFLogin = await this.storage.get('fOpen');
    this.valCnpj = await this.storage.get('cnpj');
    this.valToken = await this.storage.get('token');
    this.valIdToken = await this.storage.get('idToken');
    this.valLogin = await this.storage.get('login');
    this.valSenhaLogin = await this.storage.get('senha');
    const validateLogin = {user: this.valLogin, senha: this.valSenhaLogin, id_token: this.valIdToken};
    const validateLoginEmp = {cnpj: this.valCnpj, token: this.valToken};
    if(this.valFLogin !== false){
      this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }
    else if(this.valLogin !== null && this.valSenhaLogin !== null && this.valCnpj !== null && this.valToken !== null && this.valIdToken !== null){
      this.service.firstlogin(validateLoginEmp).subscribe(async response =>{
        if(response["status"] === "failed" || response["status"] === "blocked"){
          this.error("errLogEmp");
        }
        else if(response["status"] === "success"){
          this.service.login(validateLogin).subscribe(async response =>{
            if(response["status"] === 'success'){
              this.allFat();
              this.dayFat();
            }
            else if(response["status"] === 'failed'){
              this.error("errLog");
            }
            else if(response["status"] === 'errDB'){
              this.error("serverdb");
            }
          }, async error => {
            this.error("server");
          });
        }
        else if(response["status"] === 'errDB'){
          this.error("serverdb");
        }
      }, async error => {
        this.error("server");
      });
    }
  }

  convertInReal(num){
    return parseFloat(num).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
  }

  allFat(){
    const allFat = {cnpj: this.valCnpj, token: this.valToken, date: "all"};
    this.Lojas.allFat(allFat).subscribe(response => {
      this.unidadesHeader = Object.values(response);
      let unidades = this.unidadesHeader;
      var somaFatArray = [];
      var somaMargemArray = [];
      for(var all of unidades){
        somaFatArray.push(parseFloat(all["somaFat"]));
        somaMargemArray.push(parseFloat(all["somaMargem"]));
      }
      var prepareRealFat = somaFatArray.reduce(somaArray, 0);
      var prepareRealMargem = somaMargemArray.reduce(somaArray, 0);
      var prepareRealLiquido =  prepareRealFat - prepareRealMargem;
      function somaArray(total, numero){
        return total + numero;
      }
      this.somaAllFatTotal = prepareRealFat.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      this.somaAllMargemTotal = prepareRealMargem.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      this.totalLiquido = prepareRealLiquido.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      this.contentLoader = true;
    });
  }

  dayFat(){
    const dayFat = {cnpj: this.valCnpj, token: this.valToken, date: this.dateValue};
    this.Lojas.allFat(dayFat).subscribe(response => {
      this.unidades = Object.values(response);
      let unidades = this.unidades;
      var somaFatArray = [];
      var somaMargemArray = [];
      for(var all of unidades){
        somaFatArray.push(parseFloat((all["somaFat"])));
        somaMargemArray.push(parseFloat((all["somaMargem"])));
      }
      var prepareRealFat = somaFatArray.reduce(somaArray, 0);
      var prepareRealMargem = somaMargemArray.reduce(somaArray, 0);
      function somaArray(total, numero){
        return total + numero;
      }
      this.somaFatTotal = prepareRealFat.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      this.somaMargemTotal = prepareRealMargem.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      this.contentLoader = true;
      this.dateLoader = true;
    });
  }

  async logOut(): Promise<void>{
    await this.storage.remove("login");
    await this.storage.remove("senha");
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async error(err) {
    if(err === "server"){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: "Falha ao conectar com o servidor",
        message: 'Deseja tentar novamente ?',
        buttons: [
           {
            text: 'SAIR',
            role: 'cancel',
            cssClass: 'secondary',
            id: 'cancel-button',
            handler: () => {
             // navigator['app'].exitApp();
            }
          },
          {
            text: 'SIM',
            id: 'confirm-button',
            handler: () => {
              this.ngOnInit();
            }
          }
        ]
      });
      await alert.present();
    }
    else if(err === "serverdb"){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: "Falha ao conectar com o servidor de dados",
        message: 'Deseja tentar novamente ?',
        buttons: [
          {
            text: 'SAIR',
            role: 'cancel',
            cssClass: 'secondary',
            id: 'cancel-button',
            handler: () => {
            // navigator['app'].exitApp();
            }
          },
          {
            text: 'SIM',
            id: 'confirm-button',
            handler: () => {
              this.ngOnInit();
            }
          }
        ]
      });
      await alert.present();
    }
    else if(err === "errLogEmp"){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: "Falha ao logar na empresa",
        buttons: [
          {
            text: 'OK',
            id: 'confirm-button',
            handler: () => {
              this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
            }
          }
        ]
      });
      await alert.present();
    }
    else if(err === "errLog"){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: "Falha ao logar",
        buttons: [
          {
            text: 'OK',
            id: 'confirm-button',
            handler: () => {
              this.router.navigateByUrl('/login', { replaceUrl: true });
            }
          }
        ]
      });
      await alert.present();
    }
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Desconectar',
      message: 'Você realmente deseja desconectar da sua conta ?',
      buttons: [
        {
          text: 'NÃO',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button'
        }, {
          text: 'SIM',
          id: 'confirm-button',
          handler: () => {
            this.logOut();
          }
        }
      ]
    });
    await alert.present();
  }
  doRefresh(event) {
    this.unidades = [];
    this.unidadesHeader = [];
    this.somaAllFatTotal = "";
    this.somaAllMargemTotal = "";
    this.totalLiquido = "";
    this.somaFatTotal = "";
    this.somaMargemTotal = "";
    this.contentLoader = false;
    this.allFat();
    this.dayFat();
    const verfyComplete = setInterval(() => {
      if (this.unidades !== [] && this.unidadesHeader !== [] && this.totalLiquido !== "" && this.somaMargemTotal !== ""){
        this.contentLoader = true;
        event.target.complete();
        clearInterval(verfyComplete);
      }
    }, 300);
  }
  async dateChange(value){
    await this.storage.set("date", format(parseISO(value),"yyyy-MM-dd"));
    this.dateValue = await this.storage.get("date");
    this.dateLoader = false;
    this.dayFat();
  }
}
