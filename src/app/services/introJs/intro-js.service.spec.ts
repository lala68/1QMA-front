import { TestBed } from '@angular/core/testing';

import { IntroJsService } from './intro-js.service';

describe('IntroJsService', () => {
  let service: IntroJsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntroJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
