import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftHistoryComponent } from './gift-history.component';

describe('GiftHistoryComponent', () => {
  let component: GiftHistoryComponent;
  let fixture: ComponentFixture<GiftHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GiftHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
