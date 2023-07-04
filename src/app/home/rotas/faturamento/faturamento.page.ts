/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import {
  LoadingController,
  MenuController,
  AlertController,
  PopoverController,
  isPlatform,
  ToastController,
  NavController,
} from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ChartDataset, ChartOptions, ChartType, Color } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { timeout } from 'rxjs/operators';
import { LoginService } from 'src/app/login/services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { FaturamentoService } from 'src/app/home/services/faturamento/faturamento.service';
import { RateApp } from 'capacitor-rate-app';

@Component({
  selector: 'app-faturamento',
  templateUrl: './faturamento.page.html',
  styleUrls: ['./faturamento.page.scss'],
})
export class FaturamentoPage implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  //Chart configs
  public chartData: ChartDataset[] = [];
  public chartType: ChartType;
  public chartlabels: string[] = [];
  public chartOptions: ChartOptions = {
    locale: 'pt-BR',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Gráfico do Faturamento',
        padding: {
          top: 10,
          bottom: 0,
        },
      },
      legend: {
        display: true,
        position: 'top',
        align: 'center',
        labels: {
          boxWidth: 15,
          boxHeight: 15,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        display: null,
        ticks: {
          callback: (value) =>
            value.toLocaleString('pt-br', {
              style: 'currency',
              currency: 'BRL',
            }),
        },
      },
    },
  };

  month = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  //Settings and Bool
  indexDetalhes = 0;
  tryies = 0;
  contentLoader: boolean;
  dateLoader: boolean;
  dateLoaderTotal: boolean;
  mask: boolean;
  cmvPerc: boolean;
  perc: string;
  displayInterval: string;
  displayDay: string;
  unidadesCheck: any;
  multiempresa: any;
  displayUnidades = false;
  valueGraficoInterval: string;
  valueGraficoIntervalFilter: string;
  titleGra: string;
  fatHeaderTime: string;
  openDetails = false;

  //Login
  valFLogin: boolean;
  valCnpj: string;
  valToken: string;
  valIdToken: string;
  valLogin: string;
  valTokenUsuario: string;
  empresa: string;

  //Faturamento
  unidadesFat: string[];
  unidadesFatDetalhes: string[];
  unidadesHeader: string[];
  somaFatHeader: string;
  somaMargemHeader: string;
  somaCMVHeader: string;
  somaFatTotal: string;
  somaMargemTotal: string;
  somaCMVTotal: string;
  intervalHeader: string;
  qntCC = 0;

  //Date
  maxDate: any = format(parseISO(new Date().toISOString()), 'yyyy-MM-dd');
  interval: string;
  dateValueInit: string;
  dateValueFinish: string;
  dateValueDay: string;
  dateValueDayFormat: string;
  dateValueInitFormat: string;
  dateValueFinishFormat: string;
  dateTimeFinish: any;
  dateTimeDay: any;
  dateTimeInit: any;
  displayIntervalUnid: string;

  // storage
  private auth: any;
  private faturamentoStorage: any;
  private multiEmpresaStorage: any;
  private appConfigStorage: any;

  constructor(
    private lojas: FaturamentoService,
    private navCtrl: NavController,
    private service: LoginService,
    public loadingController: LoadingController,
    private menu: MenuController,
    private storage: Storage,
    private storageService: StorageService,
    private router: Router,
    public alertController: AlertController,
    public toastController: ToastController
  ) {}

  ngOnInit() {
    //RateApp.requestReview();
  }

  async ionViewWillEnter() {
    // Load storage
    this.auth = await this.storage.get('auth');

    if (!this.auth) {
      this.navCtrl.pop();
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    this.faturamentoStorage = await this.storage.get('faturamento');
    this.multiEmpresaStorage = await this.storage.get('multiEmpresa');
    this.appConfigStorage = await this.storage.get('appConfig');

    // Set Menu
    this.displayUnidades = false;

    // Set Loaders
    this.dateLoader = false;
    this.dateLoaderTotal = false;
    this.contentLoader = false;

    // Error Prevention
    if (!this.faturamentoStorage.configuracoes.unidadesCheck) {
      this.faturamentoStorage.configuracoes.unidadesCheck = {};
    }

    if (!(await this.storage.get('multiEmpresa'))) {
      await this.storage.set('multiEmpresa', { empresas: {} });
    }

    if (!this.faturamentoStorage.configuracoes.header.intervalo ||
        this.faturamentoStorage.configuracoes.header.intervalo === 'on') {
      this.faturamentoStorage.configuracoes.header.intervalo = 'month';
      await this.storage.set('faturamento', this.faturamentoStorage);
    }

    if (!this.faturamentoStorage.configuracoes.centrodecustos.intervalo ||
        this.faturamentoStorage.configuracoes.centrodecustos.intervalo === 'on') {
      this.faturamentoStorage.configuracoes.centrodecustos.intervalo = 'day';
      await this.storage.set('faturamento', this.faturamentoStorage);
    }

    // Set CheckBox
    this.unidadesCheck = this.faturamentoStorage.unidadesCheck;
    this.multiempresa = this.multiEmpresaStorage;
    this.empresa = this.appConfigStorage.empresaAtual;

    // Set Preferences
    this.chartType = this.faturamentoStorage.configuracoes.grafico.formato || 'bar';
    this.chartOptions.scales.y.display = !!this.faturamentoStorage.configuracoes.grafico.y;
    this.mask = this.faturamentoStorage.configuracoes.gerais.mask;
    this.cmvPerc = this.faturamentoStorage.configuracoes.gerais.cmvPerc;
    this.perc = this.cmvPerc ? '%' : '';

    switch (this.faturamentoStorage.configuracoes.header.intervalo) {
      case 'day':
        this.fatHeaderTime = 'diario';
        break;
      case 'month':
        this.fatHeaderTime = 'Mensal';
        break;
      case 'year':
        this.fatHeaderTime = 'Anual';
        this.displayInterval = 'none';
        break;
      case 'all':
        this.fatHeaderTime = 'Todos';
        break;
      default:
        this.fatHeaderTime = '';
        break;
    }

    this.valueGraficoInterval = this.faturamentoStorage.configuracoes.grafico.intervalo;
    this.valueGraficoIntervalFilter = this.valueGraficoInterval;

    // Set Dates and Filter Default
    this.interval = 'day';
    this.displayInterval = 'none';
    this.displayDay = 'block';
    this.dateTimeDay = { confirm: () => {} };
    this.dateTimeFinish = { confirm: () => {} };
    this.dateTimeInit = { confirm: () => {} };
    this.dateValueInit = this.maxDate;
    this.dateValueFinish = this.maxDate;
    this.dateValueDay = this.maxDate;
    this.dateValueInitFormat = format(parseISO(this.maxDate), 'dd/MM/yyyy');
    this.dateValueFinishFormat = format(parseISO(this.maxDate), 'dd/MM/yyyy');
    this.dateValueDayFormat = format(parseISO(this.maxDate), 'dd/MM/yyyy');

    // Login Validation
    this.valFLogin = this.appConfigStorage.firstOpen;
    this.valCnpj = this.auth.empresa.cnpj;
    this.valToken = this.auth.empresa.token;
    this.valIdToken = this.auth.empresa.id;
    this.valLogin = this.auth.usuario.login;
    this.valTokenUsuario = this.auth.usuario.token;

    if (this.valFLogin !== false ||
        !this.valTokenUsuario) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } else if (this.valLogin &&
               this.valTokenUsuario &&
               this.valCnpj &&
               this.valToken &&
               this.valIdToken) {
      this.headerFat(this.intervalHeader);
      this.unidadeFatTotal();
    }
  }


  //Faturamento
  headerFat(interval) {
    if (!interval || interval === 'on' || interval === null) {
      interval = 'month';
    }

    const interfaceHFat = {
      interval,
      date: '',
      cmvPercentage: this.cmvPerc.toString(),
      dateInit: null,
      dateFinish: null,
      fourMonths: this.valueGraficoInterval,
    };

    this.lojas.faturamento(interfaceHFat, this.valTokenUsuario).subscribe(
      (response: any) => {
        if (response.connection.error === 'invalidToken') {
          this.error('invalidToken');
        } else if (response.connection.error === 'databaseError') {
          this.error('serverdb');
        } else if (response.connection.status === 'success') {
          const grafico = response['MonthlyBillingForFourMonths'];
          this.unidadesHeader = Object.values(response['totalBilling']);
          const unidades = this.unidadesHeader;
          const somaFatArray = [];
          const somaMargemArray = [];
          const somaCMVrray = [];
          this.chartData = [];
          this.chartlabels = [];
          let n = 1;

          for (const unidade of unidades) {
            somaFatArray.push(parseFloat(unidade['somaFat']));
            this.qntCC = somaFatArray.length;
            somaMargemArray.push(parseFloat(unidade['somaMargem']));
            somaCMVrray.push(parseFloat(unidade['cmv_vlr']));
            n -= 0.15;
            const color = `rgba(255, 159, 25, ${n})`;
            const data = Object.values(grafico[unidade['unidade']])
              .map(faturamento => faturamento['faturamento']);

            this.chartData.push({
              data,
              label: unidade['unidade'],
              backgroundColor: color,
              borderColor: color,
              hoverBackgroundColor: 'rgba(255, 159, 25, 1)',
            });
          }

          if (this.valueGraficoInterval === 'lastFourMonths') {
            this.titleGra = 'Últimos quatro meses';
          } else {
            const numericValueGraficoInterval = parseInt(this.valueGraficoInterval, 10);
            this.titleGra = `${numericValueGraficoInterval}º Quadrimestre`;
          }

          for (const unidadeGRF of Object.values(grafico[unidades[0]['unidade']])) {
            this.chartlabels.push(this.month[unidadeGRF['month'] - 1]);
            this.chart.chart.update();
          }

          const prepareRealFat = somaFatArray.reduce((total, numero) => total + numero, 0);
          const prepareRealMargem = somaMargemArray.reduce((total, numero) => total + numero, 0);
          let prepareRealCMV = somaCMVrray.reduce((total, numero) => total + numero, 0) / somaCMVrray.length;

          if (!this.cmvPerc) {
            prepareRealCMV = somaCMVrray.reduce((total, numero) => total + numero, 0);
          }

          if (this.mask === true) {
            this.somaFatHeader = prepareRealFat.toLocaleString('pt-br', {
              style: 'currency',
              currency: 'BRL',
            });
            this.somaMargemHeader = prepareRealMargem.toLocaleString('pt-br', {
              style: 'currency',
              currency: 'BRL',
            });

            if (this.cmvPerc === true) {
              this.somaCMVHeader = prepareRealCMV.toFixed(2).toString();
            } else {
              this.somaCMVHeader = prepareRealCMV.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              });
            }
          } else {
            this.somaFatHeader = this.formatReall(prepareRealFat.toFixed(2));
            this.somaMargemHeader = this.formatReall(prepareRealMargem.toFixed(2));

            if (this.cmvPerc === true) {
              this.somaCMVHeader = prepareRealCMV.toFixed(2).toString();
            } else {
              this.somaCMVHeader = this.formatReall(prepareRealCMV.toFixed(2)).toString();
            }
          }

          this.contentLoader = true;
        } else {
          this.error('');
        }
      },
      async (error) => {
        if (typeof error.error.connection === 'undefined') {
          this.error(error.error);
        } else {
          this.error('');
        }
      }
    );
  }

  async unidadeFatTotal() {
    const dayFat = {
      interval: this.interval,
      date: this.dateValueDay,
      cmvPercentage: this.cmvPerc.toString(),
      dateInit: this.dateValueInit,
      dateFinish: this.dateValueFinish,
      fourMonths: this.valueGraficoInterval,
    };

    const response: any = await this.lojas.faturamento(dayFat, this.valTokenUsuario).toPromise();

    if (response.connection.status === 'success') {
      const unidades = response;
      this.unidadesFat = Object.values(response['totalBilling']);
      const unidadesFat = this.unidadesFat;

      let somaFatArray = [];
      let somaMargemArray = [];
      let somaCMVrray = [];
      const unidadesCheck = {};
      const multiempresa = {};

      if (
        !this.unidadesCheck.hasOwnProperty(this.valIdToken) ||
        Object.values(this.unidadesCheck[this.valIdToken]).length !== unidadesFat.length
      ) {
        for (const unidade of unidadesFat) {
          const somaFat = parseFloat(unidade['somaFat']);
          const somaMargem = parseFloat(unidade['somaMargem']);
          const somaCMV = parseFloat(unidade['cmv_vlr']);

          somaFatArray.push(somaFat);
          somaMargemArray.push(somaMargem);
          somaCMVrray.push(somaCMV);

          unidadesCheck[unidade['idCentroCusto']] = {
            unidade: unidade['unidade'],
            check: true,
            display: 'block',
          };

          this.unidadesCheck[this.valIdToken] = unidadesCheck;
          this.faturamentoStorage.unidadesCheck = this.unidadesCheck;
          await this.storage.set('faturamento', this.faturamentoStorage);
        }
      } else {
        let n = 1;
        for (const unidade of unidadesFat) {
          n = n - 0.15;
          const color = 'rgba(255, 159, 25,' + n + ')';

          const somaFat = parseFloat(unidade['somaFat']);
          const somaMargem = parseFloat(unidade['somaMargem']);
          const somaCMV = parseFloat(unidade['cmv_vlr']);

          somaFatArray.push(somaFat);
          somaMargemArray.push(somaMargem);
          somaCMVrray.push(somaCMV);
        }
      }

      if (
        !this.multiempresa.hasOwnProperty(this.valIdToken) ||
        unidadesFat[0]['ultimaExportacao'] !==
          Object.values(this.multiempresa[this.valIdToken])[0]['ultimaExportacao']
      ) {
        somaFatArray = [];
        somaMargemArray = [];
        somaCMVrray = [];
        for (const unidade of unidadesFat) {
          const somaFat = parseFloat(unidade['somaFat']);
          const somaMargem = parseFloat(unidade['somaMargem']);
          const somaCMV = parseFloat(unidade['cmv_vlr']);

          somaFatArray.push(somaFat);
          somaMargemArray.push(somaMargem);
          somaCMVrray.push(somaCMV);

          multiempresa[unidade['idCentroCusto']] = {
            unidade: unidade['unidade'],
            idCentroCusto: unidade['idCentroCusto'],
            idEmpBird: unidade['idEmpBird'],
            idCcBird: unidade['idCcBird'],
            telefone: unidade['telefone'],
            cep: unidade['cep'],
            endereco: unidade['endereco'],
            bairro: unidade['bairro'],
            cidade: unidade['cidade'],
            uf: unidade['uf'],
            ultimaExportacao: unidade['ultimaExportacao'],
            check: true,
            display: 'block',
            servidorLocal: unidade['servidorLocal'],
          };

          this.multiempresa.empresas[this.valIdToken].centrodecustos = multiempresa;
          await this.storage.set('multiEmpresa', this.multiempresa);
        }
      }

      const unidadesTotalBillingId = {};
      const unidadesIgnore = [];
      const ignoreSomaFatArray = [];
      const ignoreSomaMargemArray = [];
      const ignoreSomaCMVrray = [];

      for (const unidId of Object.values(unidades['totalBilling'])) {
        unidadesTotalBillingId[unidId['idCentroCusto']] = unidId;
      }

      for (const unidadegIgnore of Object.values(this.unidadesCheck[this.valIdToken])) {
        if (unidadegIgnore['check'] === false) {
          unidadesIgnore.push(unidadegIgnore['unidade']);

          const somaFat = parseFloat(
            unidadesTotalBillingId[unidadesIgnore[unidadesIgnore.length - 1]]['somaFat']
          );
          const somaMargem = parseFloat(
            unidadesTotalBillingId[unidadesIgnore[unidadesIgnore.length - 1]]['somaMargem']
          );
          const somaCMV = parseFloat(
            unidadesTotalBillingId[unidadesIgnore[unidadesIgnore.length - 1]]['cmv_vlr']
          );

          ignoreSomaFatArray.push(somaFat);
          ignoreSomaMargemArray.push(somaMargem);
          ignoreSomaCMVrray.push(somaCMV);
        }
      }

      const prepareRealFat =
        somaFatArray.reduce((total, numero) => total + numero, 0) -
        ignoreSomaFatArray.reduce((total, numero) => total + numero, 0);
      const prepareRealMargem =
        somaMargemArray.reduce((total, numero) => total + numero, 0) -
        ignoreSomaMargemArray.reduce((total, numero) => total + numero, 0);

      let prepareRealCMV =
        (somaCMVrray.reduce((total, numero) => total + numero, 0) -
          ignoreSomaCMVrray.reduce((total, numero) => total + numero, 0)) /
        (somaCMVrray.length - unidadesIgnore.length);

      if (!this.cmvPerc) {
        prepareRealCMV =
          somaCMVrray.reduce((total, numero) => total + numero, 0) -
          ignoreSomaCMVrray.reduce((total, numero) => total + numero, 0);
      }

      if (this.mask === true) {
        this.somaFatTotal = prepareRealFat.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        });
        this.somaMargemTotal = prepareRealMargem.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        });
        if (this.cmvPerc === true) {
          if (isNaN(prepareRealCMV)) {
            prepareRealCMV = 0;
            this.somaCMVTotal = prepareRealCMV.toString();
          } else {
            this.somaCMVTotal = prepareRealCMV.toFixed(2).toString();
          }
        } else if (this.cmvPerc === false) {
          this.somaCMVTotal = prepareRealCMV.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
          });
        }
        this.contentLoader = true;
        this.dateLoader = false;
        this.dateLoaderTotal = false;
      } else {
        this.somaFatTotal = this.formatReall(prepareRealFat.toFixed(2)).toString();
        this.somaMargemTotal = this.formatReall(prepareRealMargem.toFixed(2)).toString();
        if (this.cmvPerc === true) {
          if (isNaN(prepareRealCMV)) {
            prepareRealCMV = 0;
            this.somaCMVTotal = prepareRealCMV.toString();
          } else {
            this.somaCMVTotal = prepareRealCMV.toFixed(2).toString();
          }
        } else if (this.cmvPerc === false) {
          this.somaCMVTotal = this.formatReall(prepareRealCMV.toFixed(2)).toString();
        }
        this.contentLoader = true;
        this.dateLoader = false;
        this.dateLoaderTotal = false;
      }
    }
  }

  async dateChangeInit(value) {
    this.dateValueInitFormat = format(parseISO(value), 'dd/MM/yyyy');
    this.dateValueInit = value;
  }
  async dateChangeFinish(value) {
    this.dateValueFinishFormat = format(parseISO(value), 'dd/MM/yyyy');
    this.dateValueFinish = value;
  }
  async dateChangeDay(value) {
    this.dateValueDayFormat = format(parseISO(value), 'dd/MM/yyyy');
    this.dateValueDay = value;
  }
  async applyDateChanger() {
    this.dateLoader = true;
    this.dateLoaderTotal = true;
    this.unidadeFatTotal();
    if (this.valueGraficoIntervalFilter !== this.valueGraficoInterval) {
      this.valueGraficoInterval = this.valueGraficoIntervalFilter;
      this.headerFat(await this.storage.get('intervalHeader'));
    }
  }
  formatReall(valor) {
    valor = valor + '';
    valor = parseInt(valor.replace(/[\D]+/g, ''), 10);
    valor = valor + '';
    valor = valor.replace(/([0-9]{2})$/g, ',$1');
    if (valor.length > 6) {
      valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, '.$1,$2');
    }
    return valor;
  }
  convertInReal(valor) {
    if (this.mask === true) {
      return parseFloat(valor).toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
      });
    } else {
      valor = valor + '';
      valor = parseInt(valor.replace(/[\D]+/g, ''), 10);
      valor = valor + '';
      valor = valor.replace(/([0-9]{2})$/g, ',$1');
      if (valor.length > 6) {
        valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, '.$1,$2');
      }
      return valor;
    }
  }

  setGraficoInterval(event) {
    this.valueGraficoIntervalFilter = event.detail.value;
  }
  setInterval(event) {
    this.interval = event.detail.value;
    if (this.interval === 'interval') {
      this.displayIntervalUnid = 'intervalo';
      this.displayInterval = 'block';
      this.displayDay = 'none';
    } else if (this.interval === 'day') {
      this.displayInterval = 'none';
      this.displayDay = 'block';
    } else if (this.interval === 'month') {
      this.displayIntervalUnid = 'Mensal';
      this.displayDay = 'none';
      this.displayInterval = 'none';
    } else if (this.interval === 'year') {
      this.displayIntervalUnid = 'Anual';
      this.displayDay = 'none';
      this.displayInterval = 'none';
    } else if (this.interval === 'all') {
      this.displayIntervalUnid = 'Todos';
      this.displayDay = 'none';
      this.displayInterval = 'none';
    } else {
      this.displayDay = 'none';
      this.displayInterval = 'none';
    }
  }
  async unidadesChangeCheck(event: boolean, id: number) {
    const display = event ? 'block' : 'none';

    this.unidadesCheck[this.valIdToken][id] = {
      unidade: id,
      check: event,
      display: display
    };

    this.faturamentoStorage.unidadesCheck = this.unidadesCheck;
    await this.storage.set('faturamento', this.faturamentoStorage);

    this.dateLoaderTotal = true;
    this.unidadeFatTotal();
  }
  //Usuario
  async logOut(): Promise<void> {
    if (this.auth.hasOwnProperty('usuario')) {
      delete this.auth.usuario;
    }
    await this.storage.set('auth', this.auth);
    this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
  }
  redirect() {
    this.router.navigateByUrl('/home/configuracoes');
  }

  //Tratamento de Erros
  async error(err) {
    if (err === 'server') {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Falha ao conectar com o servidor',
        message: 'Deseja tentar novamente ?',
        backdropDismiss: false,
        buttons: [
          {
            text: 'SAIR',
            role: 'cancel',
            cssClass: 'secondary',
            id: 'cancel-button',
            handler: () => {
              navigator['app'].exitApp();
            },
          },
          {
            text: 'SIM',
            id: 'confirm-button',
            handler: () => {
              this.ngOnInit();
            },
          },
        ],
      });
      await alert.present();
    } else if (err === 'serverdb') {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Falha ao conectar com o servidor de dados',
        message: 'Deseja tentar novamente ?',
        backdropDismiss: false,
        buttons: [
          {
            text: 'SAIR',
            role: 'cancel',
            cssClass: 'secondary',
            id: 'cancel-button',
            handler: () => {
              navigator['app'].exitApp();
            },
          },
          {
            text: 'SIM',
            id: 'confirm-button',
            handler: () => {
              this.ngOnInit();
            },
          },
        ],
      });
      await alert.present();
    } else if (err === 'invalidToken') {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Sua sessão se expirou',
        message: 'Faça o login novamente para continuar.',
        backdropDismiss: false,
        buttons: [
          {
            text: 'OK',
            id: 'confirm-button',
            handler: () => {
              this.navCtrl.pop();
              this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
            },
          },
        ],
      });
      await alert.present();
    } else if (err === 'errLogEmp' || err === 'failed') {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Falha ao logar na empresa',
        backdropDismiss: false,
        buttons: [
          {
            text: 'OK',
            id: 'confirm-button',
            handler: () => {
              this.router.navigateByUrl('/login/empresa', { replaceUrl: true });
            },
          },
        ],
      });
      await alert.present();
    } else if (err === 'errLog') {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Falha ao logar',
        backdropDismiss: false,
        buttons: [
          {
            text: 'OK',
            id: 'confirm-button',
            handler: () => {
              this.router.navigateByUrl('/login/usuario', { replaceUrl: true });
            },
          },
        ],
      });
      await alert.present();
    } else if (err === 'blocked') {
      this.router.navigateByUrl('/login/tokenBlock', { replaceUrl: true });
    } else {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'error desconhecido',
        message: 'Deseja tentar novamente ?',
        backdropDismiss: false,
        buttons: [
          {
            text: 'SAIR',
            role: 'cancel',
            cssClass: 'secondary',
            id: 'cancel-button',
            handler: () => {
              navigator['app'].exitApp();
            },
          },
          {
            text: 'SIM',
            id: 'confirm-button',
            handler: () => {
              this.ngOnInit();
            },
          },
        ],
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
          id: 'cancel-button',
        },
        {
          text: 'SIM',
          id: 'confirm-button',
          handler: () => {
            this.logOut();
          },
        },
      ],
    });
    await alert.present();
  }
  async doRefresh(event) {
    this.unidadesFat = [];
    this.unidadesHeader = [];
    this.somaFatHeader = '';
    this.somaMargemHeader = '';
    this.somaFatTotal = '';
    this.somaMargemTotal = '';
    this.contentLoader = false;
    this.ionViewWillEnter();
    const verfyComplete = setInterval(() => {
      if (
        this.unidadesFat.length !== 0 &&
        this.unidadesHeader.length !== 0 &&
        this.somaMargemTotal !== ''
      ) {
        this.contentLoader = true;
        event.target.complete();
        clearInterval(verfyComplete);
      }
    }, 300);
  }
  async presentToast(men) {
    const toast = await this.toastController.create({
      message: men,
      duration: 2000,
      color: 'dark',
    });
    toast.present();
  }
}
