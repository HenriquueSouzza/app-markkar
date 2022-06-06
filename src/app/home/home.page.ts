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
} from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { StatusBar } from '@capacitor/status-bar';
import { StorageService } from './../servico/storage.service';
import { LoginService } from './../servico/login.service';
import { LojasService } from '../servico/lojas.service';
import { ChartDataset, ChartOptions, ChartType, Color } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  //Chart configs
  public chartData: ChartDataset[] = [];
  public chartType: ChartType = 'bar';
  public chartlabels: string[] = [];
  public chartOptions: ChartOptions = {
    locale: 'pt-BR',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Gráfico de Margem',
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
        beginAtZero: false,
        display: false,
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
  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

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

  //Login
  valFLogin: boolean;
  valCnpj: string;
  valToken: string;
  valIdToken: string;
  valLogin: string;
  valSenhaLogin: string;
  empresa: string;

  //Faturamento
  unidadesFat: string[];
  unidadesHeader: string[];
  somaFatHeader: string;
  somaMargemHeader: string;
  somaCMVHeader: string;
  somaFatTotal: string;
  somaMargemTotal: string;
  somaCMVTotal: string;
  intervalHeader: string;

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

  constructor(
    private lojas: LojasService,
    private service: LoginService,
    public loadingController: LoadingController,
    private menu: MenuController,
    private storage: Storage,
    private storageService: StorageService,
    private router: Router,
    public alertController: AlertController,
    public toastController: ToastController
  ) {}

  async ngOnInit() {
    //Set Menu
    this.menu.enable(true, 'homeMenu');
    this.displayUnidades = false;
    //Set Loaders
    this.dateLoader = false;
    this.dateLoaderTotal = false;
    this.contentLoader = false;
    //Error Prevention
    if ((await this.storage.get('unidadesCheck')) === null) {
      await this.storage.set('unidadesCheck', {});
    }
    if ((await this.storage.get('multiempresa')) === null) {
      await this.storage.set('multiempresa', {});
    }
    if (
      (await this.storage.get('intervalHeader')) === null ||
      (await this.storage.get('intervalHeader')) === '' ||
      (await this.storage.get('intervalHeader')) === 'on'
    ) {
      await this.storage.set('intervalHeader', 'month');
    }
    if (
      (await this.storage.get('interval')) === null ||
      (await this.storage.get('interval')) === '' ||
      (await this.storage.get('interval')) === 'on'
    ) {
      await this.storage.set('interval', 'day');
    }
    //Set CheckBox
    this.unidadesCheck = await this.storage.get('unidadesCheck');
    this.multiempresa = await this.storage.get('multiempresa');
    this.empresa = await this.storage.get('empresaAtual');
    //Set Preferences
    this.mask = await this.storage.get('mask');
    this.cmvPerc = await this.storage.get('cmvPerc');
    if (this.cmvPerc === true) {
      this.perc = '%';
    }
    if (this.cmvPerc === false) {
      this.perc = '';
    }
    this.intervalHeader = await this.storage.get('intervalHeader');
    this.valueGraficoInterval = await this.storage.get('intervalGrafico');
    this.valueGraficoIntervalFilter = this.valueGraficoInterval;
    //Set Dates and Filter Default
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
    //Login Validation
    this.valFLogin = await this.storage.get('fOpen');
    this.valCnpj = await this.storage.get('cnpj');
    this.valToken = await this.storage.get('token');
    this.valIdToken = await this.storage.get('idToken');
    this.valLogin = await this.storage.get('login');
    this.valSenhaLogin = await this.storage.get('senha');
    const validateLogin = {
      user: this.valLogin,
      senha: this.valSenhaLogin,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token: this.valIdToken,
    };
    const validateLoginEmp = { cnpj: this.valCnpj, token: this.valToken };
    if (this.valFLogin !== false) {
      this.router.navigateByUrl('/validate-login', { replaceUrl: true });
    } else if (
      this.valLogin !== null &&
      this.valSenhaLogin !== null &&
      this.valCnpj !== null &&
      this.valToken !== null &&
      this.valIdToken !== null
    ) {
      this.service.firstlogin(validateLoginEmp).subscribe(
        async (response) => {
          if (response['status'] === 'failed') {
            this.error('errLogEmp');
          } else if (response['status'] === 'blocked') {
            this.router.navigateByUrl('/token-block', { replaceUrl: true });
          } else if (response['status'] === 'success') {
            this.service.login(validateLogin).subscribe(
              async (res) => {
                if (res['status'] === 'success') {
                  this.headerFat(this.intervalHeader);
                  this.unidadeFatTotal();
                } else if (res['status'] === 'failed') {
                  this.error('errLog');
                } else if (res['status'] === 'errDB') {
                  this.error('serverdb');
                }
              },
              async (error) => {
                this.error('server');
              }
            );
          } else if (response['status'] === 'errDB') {
            this.error('serverdb');
          }
        },
        async (error) => {
          this.error('server');
        }
      );
    }
  }
  async ionViewDidEnter() {
    this.menu.enable(true, 'homeMenu');
    const verfyComplete = setInterval(() => {
      setTimeout(async () => {
        if (this.valSenhaLogin !== null) {
          clearInterval(verfyComplete);
          if (
            this.mask !== (await this.storage.get('mask')) ||
            this.cmvPerc !== (await this.storage.get('cmvPerc')) ||
            this.intervalHeader !==
              (await this.storage.get('intervalHeader')) ||
            this.valueGraficoInterval !==
              (await this.storage.get('intervalGrafico'))
          ) {
            this.mask = await this.storage.get('mask');
            this.cmvPerc = await this.storage.get('cmvPerc');
            this.valueGraficoInterval = await this.storage.get(
              'intervalGrafico'
            );
            if (this.cmvPerc === true) {
              this.perc = '%';
            }
            if (this.cmvPerc === false) {
              this.perc = '';
            }
            this.headerFat(await this.storage.get('intervalHeader'));
            this.unidadeFatTotal();
          }
          if (this.valCnpj !== (await this.storage.get('cnpj'))) {
            this.unidadesFat = [];
            this.unidadesHeader = [];
            this.somaFatHeader = '';
            this.somaMargemHeader = '';
            this.somaFatTotal = '';
            this.somaMargemTotal = '';
            this.contentLoader = false;
            this.ngOnInit();
          }
        }
      }, 500);
    }, 100);
    if (!isPlatform('mobileweb') && isPlatform('android')) {
      StatusBar.setBackgroundColor({ color: '#222428' });
    }
  }

  //Faturamento
  headerFat(interval) {
    if (interval === '' || interval === 'on' || interval === null) {
      interval = 'month';
    }
    const interfaceHFat = {
      cnpj: this.valCnpj,
      token: this.valToken,
      interval,
      date: '',
      cmvPercentage: this.cmvPerc.toString(),
      dateInit: null,
      dateFinish: null,
      fourMonths: this.valueGraficoInterval,
    };
    this.lojas.faturamento(interfaceHFat).subscribe(
      (response) => {
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
          somaMargemArray.push(parseFloat(unidade['somaMargem']));
          somaCMVrray.push(parseFloat(unidade['cmv_vlr']));
          n = n - 0.15;
          const color = 'rgba(255, 159, 25,' + n + ')';
          this.chartData.push({
            data: [],
            label: unidade['unidade'],
            backgroundColor: color,
            borderColor: color,
            hoverBackgroundColor: 'rgba(255, 159, 25, 1)',
          });
          for (const margem of Object.values(grafico[unidade['unidade']])) {
            this.chartData[this.chartData.length - 1].data.push(
              margem['margem']
            );
          }
        }
        if (this.valueGraficoInterval === 'lastFourMonths') {
          this.titleGra = 'Últimos quatro meses';
        } else if (this.valueGraficoInterval === 'fourMonths') {
          this.titleGra = 'Quadrimestre';
        } else if (this.valueGraficoInterval === '1FourMonth') {
          this.titleGra = '1º Quadrimestre';
        } else if (this.valueGraficoInterval === '2FourMonth') {
          this.titleGra = '2º Quadrimestre';
        } else if (this.valueGraficoInterval === '3FourMonth') {
          this.titleGra = '3º Quadrimestre';
        }
        this.chartOptions.plugins.title.text = `Gráfico de Margem ( ${this.titleGra} )`;
        for (const teste of Object.values(grafico[unidades[0]['unidade']])) {
          this.chartlabels.push(this.month[teste['month'] - 1]);
          this.chart.chart.update();
        }
        const prepareRealFat = somaFatArray.reduce(somaArray, 0);
        const prepareRealMargem = somaMargemArray.reduce(somaArray, 0);
        let prepareRealCMV =
          somaCMVrray.reduce(somaArray, 0) / somaCMVrray.length;
        if (!this.cmvPerc) {
          prepareRealCMV = somaCMVrray.reduce(somaArray, 0);
        }
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        function somaArray(total: any, numero: any): any {
          return total + numero;
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
          } else if (this.cmvPerc === false) {
            this.somaCMVHeader = prepareRealCMV.toLocaleString('pt-br', {
              style: 'currency',
              currency: 'BRL',
            });
          }
          this.contentLoader = true;
        } else {
          this.somaFatHeader = this.formatReall(prepareRealFat.toFixed(2));
          this.somaMargemHeader = this.formatReall(
            prepareRealMargem.toFixed(2)
          );
          if (this.cmvPerc === true) {
            this.somaCMVHeader = prepareRealCMV.toFixed(2).toString();
          } else if (this.cmvPerc === false) {
            this.somaCMVHeader = this.formatReall(
              prepareRealCMV.toFixed(2)
            ).toString();
          }
          this.contentLoader = true;
        }
      },
      async (error) => {}
    );
  }
  async unidadeFatTotal() {
    const dayFat = {
      cnpj: this.valCnpj,
      token: this.valToken,
      interval: this.interval,
      date: this.dateValueDay,
      cmvPercentage: this.cmvPerc.toString(),
      dateInit: this.dateValueInit,
      dateFinish: this.dateValueFinish,
      fourMonths: this.valueGraficoInterval,
    };
    this.lojas.faturamento(dayFat).subscribe(
      async (response) => {
        const unidades = response;
        this.unidadesFat = Object.values(response['totalBilling']);
        const unidadesFat = this.unidadesFat;
        const somaFatArray = [];
        const somaMargemArray = [];
        const somaCMVrray = [];
        const unidadesCheck = {};
        const multiempresa = {};
        if (
          !this.unidadesCheck.hasOwnProperty(this.empresa) ||
          Object.values(this.unidadesCheck[this.empresa]).length !==
            unidadesFat.length
        ) {
          for (const unidade of unidadesFat) {
            somaFatArray.push(parseFloat(unidade['somaFat']));
            somaMargemArray.push(parseFloat(unidade['somaMargem']));
            somaCMVrray.push(parseFloat(unidade['cmv_vlr']));
            unidadesCheck[unidade['unidade']] = {
              unidade: unidade['unidade'],
              check: true,
              display: 'block',
            };
            this.unidadesCheck[this.empresa] = unidadesCheck;
            await this.storage.set('unidadesCheck', this.unidadesCheck);
          }
        } else {
          let n = 1;
          for (const unidade of unidadesFat) {
            n = n - 0.15;
            const color = 'rgba(255, 159, 25,' + n + ')';
            somaFatArray.push(parseFloat(unidade['somaFat']));
            somaMargemArray.push(parseFloat(unidade['somaMargem']));
            somaCMVrray.push(parseFloat(unidade['cmv_vlr']));
          }
        }
        if (
          !this.multiempresa.hasOwnProperty(this.empresa) ||
          unidadesFat[0]['ultimaExportacao'] !==
            Object.values(this.multiempresa[this.empresa])[0][
              'ultimaExportacao'
            ]
        ) {
          for (const unidade of unidadesFat) {
            somaFatArray.push(parseFloat(unidade['somaFat']));
            somaMargemArray.push(parseFloat(unidade['somaMargem']));
            somaCMVrray.push(parseFloat(unidade['cmv_vlr']));
            multiempresa[unidade['unidade']] = {
              unidade: unidade['unidade'],
              telefone: unidade['telefone'],
              cep: unidade['cep'],
              endereco: unidade['endereco'],
              bairro: unidade['bairro'],
              cidade: unidade['cidade'],
              uf: unidade['uf'],
              ultimaExportacao: unidade['ultimaExportacao'],
              check: true,
              display: 'block',
            };
            this.multiempresa[this.empresa] = multiempresa;
            await this.storage.set('multiempresa', this.multiempresa);
          }
        }
        const unidadesIgnore = [];
        const ignoreSomaFatArray = [];
        const ignoreSomaMargemArray = [];
        const ignoreSomaCMVrray = [];
        for (const unidadegIgnore of Object.values(
          this.unidadesCheck[this.empresa]
        )) {
          if (unidadegIgnore['check'] === false) {
            unidadesIgnore.push(unidadegIgnore['unidade']);
            ignoreSomaFatArray.push(
              parseFloat(
                unidades['totalBilling'][
                  unidadesIgnore[unidadesIgnore.length - 1]
                ]['somaFat']
              )
            );
            ignoreSomaMargemArray.push(
              parseFloat(
                unidades['totalBilling'][
                  unidadesIgnore[unidadesIgnore.length - 1]
                ]['somaMargem']
              )
            );
            ignoreSomaCMVrray.push(
              parseFloat(
                unidades['totalBilling'][
                  unidadesIgnore[unidadesIgnore.length - 1]
                ]['cmv_vlr']
              )
            );
          }
        }
        const somaArray = (total, numero) => total + numero;
        const prepareRealFat =
          somaFatArray.reduce(somaArray, 0) -
          ignoreSomaFatArray.reduce(somaArray, 0);
        const prepareRealMargem =
          somaMargemArray.reduce(somaArray, 0) -
          ignoreSomaMargemArray.reduce(somaArray, 0);
        let prepareRealCMV =
          (somaCMVrray.reduce(somaArray, 0) -
            ignoreSomaCMVrray.reduce(somaArray, 0)) /
          (somaCMVrray.length - unidadesIgnore.length);
        if (!this.cmvPerc) {
          prepareRealCMV =
            somaCMVrray.reduce(somaArray, 0) -
            ignoreSomaCMVrray.reduce(somaArray, 0);
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
          this.somaFatTotal = this.formatReall(
            prepareRealFat.toFixed(2)
          ).toString();
          this.somaMargemTotal = this.formatReall(
            prepareRealMargem.toFixed(2)
          ).toString();
          if (this.cmvPerc === true) {
            if (isNaN(prepareRealCMV)) {
              prepareRealCMV = 0;
              this.somaCMVTotal = prepareRealCMV.toString();
            } else {
              this.somaCMVTotal = prepareRealCMV.toFixed(2).toString();
            }
          } else if (this.cmvPerc === false) {
            this.somaCMVTotal = this.formatReall(
              prepareRealCMV.toFixed(2)
            ).toString();
          }
          this.contentLoader = true;
          this.dateLoader = false;
          this.dateLoaderTotal = false;
        }
      },
      async (error) => {
        if (typeof error.error.connection == 'undefined') {
          this.error(error.error);
        } else {
          this.error(error.error.connection.status);
        }
      }
    );
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
    valor = parseInt(valor.replace(/[\D]+/g, ''));
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
      valor = parseInt(valor.replace(/[\D]+/g, ''));
      valor = valor + '';
      valor = valor.replace(/([0-9]{2})$/g, ',$1');
      if (valor.length > 6) {
        valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, '.$1,$2');
      }
      return valor;
    }
  }

  async setGraficoInterval(event) {
    this.valueGraficoIntervalFilter = event.detail.value;
  }
  async setInterval(event) {
    await this.storage.set('interval', event.detail.value);
    this.interval = await this.storage.get('interval');
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
  async unidadesChangeCheck(event, id) {
    let display = 'block';
    if (!event) {
      display = 'none';
    }
    this.unidadesCheck[this.empresa][id]['unidade'] = id;
    this.unidadesCheck[this.empresa][id]['check'] = event;
    this.unidadesCheck[this.empresa][id]['display'] = display;
    await this.storage.set('unidadesCheck', this.unidadesCheck);
    this.dateLoaderTotal = true;
    this.unidadeFatTotal();
  }

  //Usuario
  async logOut(): Promise<void> {
    await this.storage.remove('login');
    await this.storage.remove('senha');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
  redirect() {
    this.router.navigateByUrl('/settings');
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
              this.router.navigateByUrl('/login-empresa', { replaceUrl: true });
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
              this.router.navigateByUrl('/login', { replaceUrl: true });
            },
          },
        ],
      });
      await alert.present();
    } else if (err === 'blocked') {
      this.router.navigateByUrl('/token-block', { replaceUrl: true });
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
    this.ngOnInit();
    const verfyComplete = setInterval(() => {
      if (
        this.unidadesFat !== [] &&
        this.unidadesHeader !== [] &&
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
