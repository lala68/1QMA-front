import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupSocialComponent } from './signup-social.component';

describe('SignupSocialComponent', () => {
  let component: SignupSocialComponent;
  let fixture: ComponentFixture<SignupSocialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupSocialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignupSocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
