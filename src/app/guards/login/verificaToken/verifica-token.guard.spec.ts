import { TestBed } from '@angular/core/testing';

import { VerificaTokenGuard } from './verifica-token.guard';

describe('VerificaTokenGuard', () => {
  let guard: VerificaTokenGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VerificaTokenGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
