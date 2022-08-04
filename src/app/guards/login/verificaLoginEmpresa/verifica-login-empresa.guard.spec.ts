import { TestBed } from '@angular/core/testing';

import { VerificaLoginEmpresaGuard } from './verifica-login-empresa.guard';

describe('VerificaLoginEmpresaGuard', () => {
  let guard: VerificaLoginEmpresaGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VerificaLoginEmpresaGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
