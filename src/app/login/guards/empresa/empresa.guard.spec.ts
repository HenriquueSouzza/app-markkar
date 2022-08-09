import { TestBed } from '@angular/core/testing';

import { EmpresaGuard } from './empresa.guard';

describe('EmpresaGuard', () => {
  let guard: EmpresaGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(EmpresaGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
