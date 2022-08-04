import { TestBed } from '@angular/core/testing';

import { PrimeiroLoginGuard } from './primeiro-login.guard';

describe('PrimeiroLoginGuard', () => {
  let guard: PrimeiroLoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PrimeiroLoginGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
