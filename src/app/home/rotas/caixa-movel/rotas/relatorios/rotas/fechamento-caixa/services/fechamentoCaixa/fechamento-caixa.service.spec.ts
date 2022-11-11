import { TestBed } from '@angular/core/testing';

import { FechamentoCaixaService } from './fechamento-caixa.service';

describe('FechamentoCaixaService', () => {
  let service: FechamentoCaixaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FechamentoCaixaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
