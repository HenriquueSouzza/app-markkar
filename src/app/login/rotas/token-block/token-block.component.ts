/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatform, LoadingController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StatusBar } from '@capacitor/status-bar';
import { LoginService } from '../../services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';


@Component({
  selector: 'app-token-block',
  templateUrl: './token-block.component.html',
  styleUrls: ['./token-block.component.scss'],
})
export class TokenBlockComponent implements OnInit {

  loader = true;

  constructor(
    private menu: MenuController,
    private service: LoginService,
    private router: Router,
    public loadingController: LoadingController,
    private storageService: StorageService,
    private storage: Storage) { }

  async ngOnInit() {
    this.menu.enable(false, 'homeMenu');
    const valCnpj = await this.storage.get('cnpj');
    const valToken = await this.storage.get('token');
    const validatefLogin = {cnpj: valCnpj, token: valToken};
    if(valCnpj !== null && valToken !== null){
      this.service.firstlogin(validatefLogin).subscribe(async response =>{
        if(response['status'] === 'failed'){
          this.loader = false;
          this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
        }
        else if(response['status'] === 'blocked'){
          this.loader = false;
        }
        else if(response['status'] === 'success'){
          this.loader = false;
          this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
        }
        else if(response['status'] === 'errDB'){
          this.loader = false;
          alert('falha ao conectar com o servidor de dados');
        }
      }, async error => {
        this.loader = false;
        alert('falha ao conectar com o servidor');
      });
    }
    if(!isPlatform('mobileweb') && isPlatform('android')){
      StatusBar.setBackgroundColor({color: '#222428'});
    }
  }

  verify(){
    this.loader = true;
    this.ngOnInit();
  }

  change(){
    this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
  }
}
