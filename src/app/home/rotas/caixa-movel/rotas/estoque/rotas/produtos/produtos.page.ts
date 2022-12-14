import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { EstoqueService } from '../../services/estoque/estoque.service';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.scss'],
})
export class ProdutosPage implements OnInit {
  public idEmpBird: string;
  public produtos: any;
  public idCc: string;
  private codeBar: string;
  private nome: string;
  private estoqueStorage: any;

  constructor(
    private estoqueService: EstoqueService,
    private navCtrl: NavController,
    private storage: Storage,
    private storageService: StorageService,
    private route: ActivatedRoute
    ) { }

  async ngOnInit() {
    this.estoqueStorage = await this.storage.get('estoque');
    this.route.queryParamMap.subscribe((params: any) => {
      if (params) {
        this.idEmpBird = params.params.id1;
        this.idCc = params.params.id2;
        this.codeBar = params.params.code;
        this.nome = params.params.nome;
      }
    });
    this.estoqueService
        .consultaProduto({
          codeEmp: this.idEmpBird,
          codeCC: this.idCc,
          codeBar: this.codeBar,
          nome: this.nome
        })
        .subscribe(async (res: any) => {
          console.log(res);
          this.produtos = Object.values(res.produtos);
          if(res.produtos.length === 1){
            if (this.estoqueStorage.historico.length > 4){
              this.estoqueStorage.historico.pop();
              this.estoqueStorage.historico.unshift({nome: res.produtos[0].NOME_PRODUTO, codeBar: res.produtos[0].COD_BARRA});
              await this.storage.set('estoque', this.estoqueStorage);
            } else {
              this.estoqueStorage.historico.unshift({nome: res.produtos[0].NOME_PRODUTO, codeBar: res.produtos[0].COD_BARRA});
              await this.storage.set('estoque', this.estoqueStorage);
            }
          }
          //{COD_BARRA: "7899838806976" COD_PRODUTO: "4371" NOME_PRODUTO: "TESTE HENRIQUE" QTD_ESTOQUE: "50" UNIDADE: "UN" VALOR: "5"}
        });
  }

}
