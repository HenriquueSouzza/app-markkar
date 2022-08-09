import { TestBed } from '@angular/core/testing';

import { BemVindoGuard } from './bem-vindo.guard';

describe('BemVindoGuard', () => {
  let guard: BemVindoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(BemVindoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
