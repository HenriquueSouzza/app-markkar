import { TestBed } from '@angular/core/testing';

import { ControleVersaoService } from './controle-versao.service';

describe('ControleVersaoService', () => {
  let service: ControleVersaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControleVersaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
