import { Component, OnInit } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { isPlatform } from '@ionic/angular';
import { FechamentoCaixaService } from './services/fechamentoCaixa/fechamento-caixa.service';

@Component({
  selector: 'app-fechamento-caixa',
  templateUrl: './fechamento-caixa.page.html',
  styleUrls: ['./fechamento-caixa.page.scss'],
})
export class FechamentoCaixaPage implements OnInit {

  constructor(private file: File, private opener: FileOpener, private relatoriosService: FechamentoCaixaService) {}

  ngOnInit() {
    this.relatoriosService.get('31').subscribe((response) => {
      console.log(response);
    });
  }

  abrirRelatorio() {
    const data = '';
    const downloadPDF = async (href) => {
      const downloadLink = document.createElement('a');
      downloadLink.href = href;
      downloadLink.download = 'teste.pdf';
      downloadLink.click();
    };

    if (
      isPlatform('mobileweb') ||
      isPlatform('pwa') ||
      (isPlatform('desktop') && !isPlatform('android') && !isPlatform('ios'))
    ) {
      downloadPDF(data);
    } else {
      this.saveAndOpenPdf(data, 'teste');
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
}
