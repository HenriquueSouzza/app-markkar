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
import { LoadingController, MenuController, AlertController, PopoverController } from '@ionic/angular';
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

//Settings and Bool
  contentLoader: boolean;
  dateLoader: boolean;
  mask: boolean;
  cmvPerc: boolean;
  perc: string;
  displayInterval: string;
  displayDay: string;
  unidadesCheck: any;
  displayUnidades = false;

//Login
  valFLogin: boolean;
  valCnpj: string;
  valToken: string;
  valIdToken: string;
  valLogin: string;
  valSenhaLogin: string;

//Faturamento
  unidadesFat: string[];
  unidadesHeader: string[];
  somaFatHeader: string;
  somaMargemHeader: string;
  somaCMVHeader: string;
  somaFatTotal: string;
  somaMargemTotal: string;
  somaCMVTotal: string;

//Date
  maxDate: any = format(parseISO(new Date().toISOString()),"yyyy-MM-dd");
  interval: string;
  dateValueInit: string;
  dateValueFinish: string;
  dateValueDay: string;
  dateValueDayFormat: string;
  dateValueInitFormat: string;
  dateValueFinishFormat: string;

  constructor(private Lojas: LojasService, private service: LoginService, public loadingController: LoadingController, private menu: MenuController, private storage: Storage, private storageService: StorageService, private router: Router, public alertController: AlertController) { }

  async ngOnInit() {
    //Set Menu
    this.menu.enable(true, 'homeMenu');
    this.displayUnidades = false;
    //Set Loaders
    this.dateLoader = true;
    this.contentLoader = false;
    //Error Prevention
    if(await this.storage.get("unidadesCheck") === null){await this.storage.set("unidadesCheck", {});}
    if(await this.storage.get("intervalHeader") === null || await this.storage.get("intervalHeader") === "" || await this.storage.get("intervalHeader") === "on"){await this.storage.set("intervalHeader", "month");}
    if(await this.storage.get("interval") === null || await this.storage.get("interval") === "" || await this.storage.get("interval") === "on"){await this.storage.set("interval", "day");}
    //Set CheckBox
    this.unidadesCheck = await this.storage.get("unidadesCheck");
    //Set Preferences
    this.mask = await this.storage.get("mask");
    this.cmvPerc = await this.storage.get("cmvPerc");
    if(this.cmvPerc === true){this.perc = "%";}
    if(this.cmvPerc === false){this.perc = "";}
    //Set Dates and Filter Default
    this.interval = "day";
    this.displayInterval = "none";
    this.displayDay = "block";
    this.dateValueInit = this.maxDate;
    this.dateValueFinish = this.maxDate;
    this.dateValueDay = this.maxDate;
    this.dateValueInitFormat = format(parseISO(this.maxDate), "dd/MM/yyyy");
    this.dateValueFinishFormat = format(parseISO(this.maxDate), "dd/MM/yyyy");
    this.dateValueDayFormat = format(parseISO(this.maxDate), "dd/MM/yyyy");
    //Login Validation
    this.valFLogin = await this.storage.get('fOpen');
    this.valCnpj = await this.storage.get('cnpj');
    this.valToken = await this.storage.get('token');
    this.valIdToken = await this.storage.get('idToken');
    this.valLogin = await this.storage.get('login');
    this.valSenhaLogin = await this.storage.get('senha');
    const validateLogin = {user: this.valLogin, senha: this.valSenhaLogin, id_token: this.valIdToken};
    const validateLoginEmp = {cnpj: this.valCnpj, token: this.valToken};
    if(this.valFLogin !== false){
      this.router.navigateByUrl('/validate-login', { replaceUrl: true });
    }
    else if(this.valLogin !== null && this.valSenhaLogin !== null && this.valCnpj !== null && this.valToken !== null && this.valIdToken !== null){
      this.service.firstlogin(validateLoginEmp).subscribe(async response =>{
        if(response["status"] === "failed"){
          this.error("errLogEmp");
        }
        else if(response["status"] === "blocked"){
          this.router.navigateByUrl('/token-block', { replaceUrl: true });
        }
        else if(response["status"] === "success"){
          this.service.login(validateLogin).subscribe(async response =>{
            if(response["status"] === 'success'){
              this.headerFat(await this.storage.get("intervalHeader"));
              this.unidadeFatTotal();
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

  //Faturamento
  headerFat(interval){
    if(interval === "" || interval === "on" || interval === null){interval = "month";}
    const interfaceHFat = {cnpj: this.valCnpj, token: this.valToken, interval, date:"", cmvPercentage: this.cmvPerc.toString(), dateInit: null, dateFinish: null};
    this.Lojas.faturamento(interfaceHFat).subscribe(response => {
      this.unidadesHeader = Object.values(response["Faturamento"]);
      let unidades = this.unidadesHeader;
      var somaFatArray = [];
      var somaMargemArray = [];
      var somaCMVrray = [];
      var rows = 0;
      for(var all of unidades){
        somaFatArray.push(parseFloat(all["somaFat"]));
        somaMargemArray.push(parseFloat(all["somaMargem"]));
        somaCMVrray.push(parseFloat(all["cmv_vlr"]));
        rows = rows + 1;
      }
      var prepareRealFat = somaFatArray.reduce(somaArray, 0);
      var prepareRealMargem = somaMargemArray.reduce(somaArray, 0);
      var prepareRealCMV = somaCMVrray.reduce(somaArray, 0) / rows;
      function somaArray(total, numero){
        return total + numero;
      }
      if(this.mask === true){
        this.somaFatHeader = prepareRealFat.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
        this.somaMargemHeader = prepareRealMargem.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
        if(this.cmvPerc === true){
          this.somaCMVHeader = prepareRealCMV.toString();
        }
        else if(this.cmvPerc === false){
          this.somaCMVHeader = prepareRealCMV.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
        }
        this.contentLoader = true;
      }else{
        this.somaFatHeader = prepareRealFat;
        this.somaMargemHeader = prepareRealMargem;
        this.somaCMVHeader = prepareRealCMV.toString();
        this.contentLoader = true;
      }
    });
  }
  async unidadeFatTotal(){
    const dayFat = {cnpj: this.valCnpj, token: this.valToken, interval: this.interval, date: this.dateValueDay, cmvPercentage: this.cmvPerc.toString(), dateInit: this.dateValueInit, dateFinish: this.dateValueFinish};
    this.Lojas.faturamento(dayFat).subscribe(async response => {
      var unidades = response;
      this.unidadesFat = Object.values(response["Faturamento"]);
      let unidadesFat = this.unidadesFat;
      var somaFatArray = [];
      var somaMargemArray = [];
      var somaCMVrray = [];
      if(Object.values(this.unidadesCheck).length === 0){
        for(var all of unidadesFat){
          somaFatArray.push(parseFloat((all["somaFat"])));
          somaMargemArray.push(parseFloat((all["somaMargem"])));
          somaCMVrray.push(parseFloat(all["cmv_vlr"]));
          this.unidadesCheck[all["nome_cc"]] = {unidade: all["nome_cc"], check: true, display: 'block'};
          await this.storage.set("unidadesCheck", this.unidadesCheck);
        }
      }else{
        for(var all of unidadesFat){
          somaFatArray.push(parseFloat((all["somaFat"])));
          somaMargemArray.push(parseFloat((all["somaMargem"])));
          somaCMVrray.push(parseFloat(all["cmv_vlr"]));
        }
      }
      var unidadesIgnore = [];
      var ignoreSomaFatArray = [];
      var ignoreSomaMargemArray = [];
      var ignoreSomaCMVrray = [];
      for(var tt of Object.values(this.unidadesCheck)){
        if(tt['check'] === false){
          unidadesIgnore.push(tt['unidade']);
          for(tt of Object.values(unidades)){
            ignoreSomaFatArray.push(parseFloat(tt[unidadesIgnore[unidadesIgnore.length - 1]]['somaFat']));
            ignoreSomaMargemArray.push(parseFloat(tt[unidadesIgnore[unidadesIgnore.length - 1]]['somaMargem']));
            ignoreSomaCMVrray.push(parseFloat(tt[unidadesIgnore[unidadesIgnore.length - 1]]['cmv_vlr']));
          }
        }
      }
      console.log(unidadesIgnore);
      console.log(ignoreSomaFatArray);
      var prepareRealFat = somaFatArray.reduce(somaArray, 0) - ignoreSomaFatArray.reduce(somaArray, 0);
      var prepareRealMargem = somaMargemArray.reduce(somaArray, 0) - ignoreSomaMargemArray.reduce(somaArray, 0);
      var prepareRealCMV = (somaCMVrray.reduce(somaArray, 0) - ignoreSomaCMVrray.reduce(somaArray, 0)) / (somaCMVrray.length-unidadesIgnore.length);
      function somaArray(total, numero){
        return total + numero;
      }
      if(this.mask === true){
        this.somaFatTotal = prepareRealFat.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
        this.somaMargemTotal = prepareRealMargem.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
        if(this.cmvPerc === true){
          this.somaCMVTotal = prepareRealCMV.toString();
        }
        else if(this.cmvPerc === false){
          this.somaCMVTotal = prepareRealCMV.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
        }
        this.contentLoader = true;
        this.dateLoader = true;
      }else{
        this.somaFatTotal = prepareRealFat.toString();
        this.somaMargemTotal = prepareRealMargem.toString();
        this.somaCMVTotal = prepareRealCMV.toString();
        this.contentLoader = true;
        this.dateLoader = true;
      }
    });
  }
  async dateChangeInit(value){
    this.dateValueInitFormat = format(parseISO( value), "dd/MM/yyyy");
    this.dateValueInit = value;
  }
  async dateChangeFinish(value){
    this.dateValueFinishFormat = format(parseISO( value), "dd/MM/yyyy");
    this.dateValueFinish = value;
  }
  async dateChangeDay(value){
    this.dateValueDayFormat = format(parseISO( value), "dd/MM/yyyy");
    this.dateValueDay = value;
  }
  applyDateChanger(){
    this.dateLoader = false;
    this.unidadeFatTotal();
  }
  convertInReal(num){
    if(this.mask === true){
      return parseFloat(num).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    }else{
      return num;
    }
  }
  async setInterval(event){
    await this.storage.set("interval", event.detail.value);
    this.interval = await this.storage.get("interval");
    if(this.interval === "interval"){
      this.displayInterval = "block";
      this.displayDay = "none";
    }
    else if(this.interval === "day"){
      this.displayInterval = "none";
      this.displayDay = "block";
    }
    else{
      this.displayDay = "none";
      this.displayInterval = "none";
    }
  }
  async unidadesChangeCheck(event, id){
    if(event === true){var display = 'block';}else if(event === false){var display = 'none';}
    this.unidadesCheck[id] = {unidade: id, check: event, display};
    await this.storage.set("unidadesCheck", this.unidadesCheck);
  }

  //Usuario
  async logOut(): Promise<void>{
    await this.storage.remove("login");
    await this.storage.remove("senha");
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
  redirect(){
    this.router.navigateByUrl('/settings');
  }

  //Tratamento de Erros
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

  //Outras Funcoes
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
  async doRefresh(event) {
    this.unidadesFat = [];
    this.unidadesHeader = [];
    this.somaFatHeader = "";
    this.somaMargemHeader = "";
    this.somaFatTotal = "";
    this.somaMargemTotal = "";
    this.contentLoader = false;
    this.ngOnInit();
    const verfyComplete = setInterval(() => {
      if (this.unidadesFat !== [] && this.unidadesHeader !== [] && this.somaMargemTotal !== ""){
        this.contentLoader = true;
        event.target.complete();
        clearInterval(verfyComplete);
      }
    }, 300);
  }
}
