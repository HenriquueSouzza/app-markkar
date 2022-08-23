/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { EstoqueService } from '../../services/estoque/estoque.service';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.scss'],
})
export class ProdutosPage implements OnInit {
  private idEmpBird: string;
  private idCc: string;
  private codeBar: string;
  private nome: string;
  public produtos: any;

  constructor(
    private estoqueService: EstoqueService,
    private navCtrl: NavController,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
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
        .subscribe((res: any) => {
          this.produtos = Object.values(res.produtos);
          //{COD_BARRA: "7899838806976" COD_PRODUTO: "4371" NOME_PRODUTO: "TESTE HENRIQUE" QTD_ESTOQUE: "50" UNIDADE: "UN" VALOR: "5"}
        });
  }

}
