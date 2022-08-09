import { TestBed } from '@angular/core/testing';

import { TokenBlockGuard } from './token-block.guard';

describe('TokenBlockGuard', () => {
  let guard: TokenBlockGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TokenBlockGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
