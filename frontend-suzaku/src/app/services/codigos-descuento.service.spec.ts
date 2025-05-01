import { TestBed } from '@angular/core/testing';

import { CodigosDescuentoService } from './codigos-descuento.service';

describe('CodigosDescuentoService', () => {
  let service: CodigosDescuentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodigosDescuentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
