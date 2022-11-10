import { Component, OnInit } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { isPlatform, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { format, parseISO } from 'date-fns';
import { FechamentoCaixaService } from './services/fechamentoCaixa/fechamento-caixa.service';

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

  constructor(
    private file: File,
    private opener: FileOpener,
    private relatoriosService: FechamentoCaixaService,
    public loadingController: LoadingController,
    private route: ActivatedRoute
  ) {}

  //falta passar o token e tirar da api local

  ngOnInit() {
    this.route.queryParamMap.subscribe((params: any) => {
      if (params) {
        this.idCc = params.params.id;
      }
    });
    this.baixarPDF();
  }

  abrirRelatorio(pdf, nome) {
    const data = pdf;
    const downloadPDF = async (href) => {
      const downloadLink = document.createElement('a');
      downloadLink.href = href;
      downloadLink.download = nome;
      downloadLink.click();
    };

    if (
      isPlatform('mobileweb') ||
      isPlatform('pwa') ||
      (isPlatform('desktop') && !isPlatform('android') && !isPlatform('ios'))
    ) {
      downloadPDF(data);
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
      message: 'Buscando aguarde...'
    });
    await loading.present();
    this.relatoriosService.get(this.idCc).subscribe(async (response: any) => {
      if(response.connection.status === 'success') {
        await loading.dismiss();
        this.relatoriosData = Object.keys(response.relatorios);
        this.relatorios = Object.values(response.relatorios);
      } else {
        this.relatoriosData = [];
        this.relatorios = [];
        this.semRelatorio = true;
        await loading.dismiss();
      }
    });
  }
}
