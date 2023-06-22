/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  public async getIpServidorLocal() {
    const caixaMovelStorage = await this.storage.get('caixa-movel');
    return caixaMovelStorage.configuracoes.slectedIds.ipLocal;
  }
}
