/* eslint-disable @typescript-eslint/dot-notation */
import { CepService } from './servico/cep.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './servico/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  empresas: any;
  unidades: any;
  name: string;
  modalOpCl = false;
  platform = isPlatform('android');

  constructor(
    private storage: Storage,
    private storageService: StorageService,
    private router: Router,
    public toastController: ToastController,
    public searchCep: CepService
    ) {}

  async ngOnInit() {
    //this.searchStreet('22725030');
    this.empresas = Object.values(await this.storage.get('empresas'));
    this.unidades = await this.storage.get('unidadesCheck');
    this.name = await this.storage.get('login');
  }

  async changeEmpresa(empresa, cnpj, token, idToken){
    await this.storageService.set('cnpj', cnpj);
    await this.storageService.set('token', token);
    await this.storageService.set('idToken', idToken);
    await this.storageService.set('empresaAtual', empresa);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  redirect(){
    this.router.navigateByUrl('/login-empresa', { replaceUrl: false });
  }

  async deleteEmp(empresa, cnpj, token, idToken){
    const empresas = await this.storage.get('empresas');
    if(empresa === await this.storage.get('empresaAtual') &&
    cnpj === await this.storage.get('cnpj') &&
    token === await this.storage.get('token') &&
    idToken === await this.storage.get('idToken')
    ){
      await this.storageService.set('cnpj', '');
      await this.storageService.set('token', '');
      await this.storageService.set('idToken', '');
      await this.storageService.set('empresaAtual', '');
      delete empresas[empresa];
      await this.storage.set('empresas', empresas);
      this.ngOnInit();
      this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
    }else{
      delete empresas[empresa];
      await this.storage.set('empresas', empresas);
      this.ngOnInit();
    }
  }

  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark'
    });
    toast.present();
  }

  cnpjMask(cnpj){
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  telMask(telNumber){
    if(telNumber === null || telNumber === ''){
      return 'Não Cadastrado';
    }else{
      return telNumber.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  }

  nullEmail(email){
    if(email === null || email === ''){
      return 'Não Cadastrado';
    }else{ return email;}
  }

  searchStreet(cep){
    this.searchCep.searchForCep(cep).subscribe(response => {
      console.log(response);
    });
  }

  forUnids(val){
    return Object.values(val);
  }
}
