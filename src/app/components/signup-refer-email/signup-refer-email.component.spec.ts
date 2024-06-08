import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupReferEmailComponent } from './signup-refer-email.component';

describe('SignupReferEmailComponent', () => {
  let component: SignupReferEmailComponent;
  let fixture: ComponentFixture<SignupReferEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupReferEmailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignupReferEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
