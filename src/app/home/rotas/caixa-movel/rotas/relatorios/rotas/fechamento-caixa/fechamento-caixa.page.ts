import { Component, OnInit } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { AlertController, isPlatform, LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { format, parseISO } from 'date-fns';
import { FechamentoCaixaService } from './services/fechamentoCaixa/fechamento-caixa.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-fechamento-caixa',
  templateUrl: './fechamento-caixa.page.html',
  styleUrls: ['./fechamento-caixa.page.scss'],
})
export class FechamentoCaixaPage implements OnInit {

  public relatorios: any;
  public relatoriosData: any;
  public semRelatorio = false;
  private idCc: string;
  private auth: any;
  private valTokenUsuario: string;

  constructor(
    public loadingController: LoadingController,
    public alertController: AlertController,
    private file: File,
    private opener: FileOpener,
    private relatoriosService: FechamentoCaixaService,
    private storage: Storage,
    private storageService: StorageService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    //loadStorage
    this.auth = await this.storage.get('auth');

    //verifyLogin
    this.valTokenUsuario = this.auth.usuario.token;
    if (this.valTokenUsuario === null || this.valTokenUsuario === undefined) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
    else if (this.valTokenUsuario !== null) {

      //getParam
      this.route.queryParamMap.subscribe((params: any) => {
        if (params) {
          this.idCc = params.params.id;
        }
      });

      //querySQL
      this.baixarPDF();
    }
  }

  abrirRelatorio(pdf, nome) {
    const data = pdf;
    const downloadPDF = async (href) => {
      const downloadLink = document.createElement('a');
      downloadLink.href = 'data:application/pdf;base64,' + href;
      downloadLink.download = nome;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    if (
      isPlatform('mobileweb') ||
      isPlatform('pwa') ||
      (isPlatform('desktop') && !isPlatform('android') && !isPlatform('ios'))
    ) {
      downloadPDF(data);
      console.log('teste');
    } else {
      this.saveAndOpenPdf(data, nome);
    }
  }

  saveAndOpenPdf(pdf: string, filename: string) {
    const writeDirectory = isPlatform('ios')
      ? this.file.dataDirectory
      : this.file.externalDataDirectory;
    this.file
      .writeFile(
        writeDirectory,
        filename,
        this.convertBase64ToBlob(pdf, 'data:application/pdf;base64'),
        { replace: true }
      )
      .then(async () => {
        this.opener
          .open(writeDirectory + filename, 'application/pdf')
          .catch(() => {
            alert('Error opening pdf file');
          });
      })
      .catch(() => {
        console.error('Error writing pdf file');
      });
  }

  convertBase64ToBlob(b64Data, contentType): Blob {
    contentType = contentType || '';
    const sliceSize = 512;
    b64Data = b64Data.replace(/^[^,]+,/, '');
    b64Data = b64Data.replace(/\s/g, '');
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  formartarData(data){
    return format(parseISO(data), 'dd/MM/yyyy');
  }

  async baixarPDF(){
    const loading = await this.loadingController.create({
      message: 'Gerando os PDFs aguarde...'
    });
    await loading.present();
    this.relatoriosService.get(this.idCc, this.valTokenUsuario).subscribe(async (response: any) => {
      console.log(response);
      if (response.connection.error === 'invalidToken') {
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
      } else if(response.connection.status === 'success') {
        this.semRelatorio = false;
        await loading.dismiss();
        this.relatoriosData = Object.keys(response.relatorios);
        this.relatorios = Object.values(response.relatorios);
      } else {
        this.relatoriosData = [];
        this.relatorios = [];
        this.semRelatorio = true;
        await loading.dismiss();
      }
    }, async (error) => {
      this.relatoriosData = [];
      this.relatorios = [];
      this.semRelatorio = true;
      await loading.dismiss();
      alert('Falha ao conectar ao servidor');
    });
  }
}
