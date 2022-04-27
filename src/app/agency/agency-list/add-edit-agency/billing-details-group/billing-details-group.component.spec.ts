import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingDetailsGroupComponent } from './billing-details-group.component';

describe('BillingDetailsGroupComponent', () => {
  let component: BillingDetailsGroupComponent;
  let fixture: ComponentFixture<BillingDetailsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingDetailsGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingDetailsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
