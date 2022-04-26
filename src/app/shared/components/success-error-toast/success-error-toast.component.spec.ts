import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessErrorToastComponent } from './success-error-toast.component';

describe('SuccessErrorToastComponent', () => {
  let component: SuccessErrorToastComponent;
  let fixture: ComponentFixture<SuccessErrorToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessErrorToastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessErrorToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
