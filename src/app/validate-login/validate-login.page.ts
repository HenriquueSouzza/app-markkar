import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { StorageService } from './../servico/storage.service';


@Component({
  selector: 'app-validate-login',
  templateUrl: './validate-login.page.html',
  styleUrls: ['./validate-login.page.scss'],
})
export class ValidateLoginPage implements OnInit {

  constructor(private router: Router, private storage: Storage, private storageService: StorageService) { }

  async ngOnInit() {
    const dataBase = await this.storage.get('bd');
    const login = await this.storage.get('login');
    if(dataBase !== null && login !== null){
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
    else if(dataBase !== null){
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
    else{
      this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
    }
  }
}
