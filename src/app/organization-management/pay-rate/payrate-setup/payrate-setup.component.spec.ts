import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrateSetupComponent } from './payrate-setup.component';

describe('PayrateSetupComponent', () => {
  let component: PayrateSetupComponent;
  let fixture: ComponentFixture<PayrateSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrateSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrateSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
