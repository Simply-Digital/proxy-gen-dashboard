import { TestBed } from '@angular/core/testing';

import { ProxyGenerationService } from './proxy-generation.service';

describe('ProxyGenerationService', () => {
  let service: ProxyGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProxyGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
