import { TestBed } from '@angular/core/testing';

import { LoaderInterceptService } from './loader-intercept.service';

describe('LoaderInterceptService', () => {
  let service: LoaderInterceptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderInterceptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
