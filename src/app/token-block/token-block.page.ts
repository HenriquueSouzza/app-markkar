/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { LoginService } from '../servico/login.service';
import { StorageService } from '../servico/storage.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-token-block',
  templateUrl: './token-block.page.html',
  styleUrls: ['./token-block.page.scss'],
})
export class TokenBlockPage implements OnInit {

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
          this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
        }
        else if(response['status'] === 'blocked'){
          this.loader = false;
        }
        else if(response['status'] === 'success'){
          this.loader = false;
          this.router.navigateByUrl('/login', { replaceUrl: true });
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
  }

  verify(){
    this.loader = true;
    this.ngOnInit();
  }

  change(){
    this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
  }
}
