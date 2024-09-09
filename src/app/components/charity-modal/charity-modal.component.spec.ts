import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharityModalComponent } from './charity-modal.component';

describe('CharityModalComponent', () => {
  let component: CharityModalComponent;
  let fixture: ComponentFixture<CharityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharityModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CharityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
