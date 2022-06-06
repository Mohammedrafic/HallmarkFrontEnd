import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillRateTypeMappingComponent } from './bill-rate-type-mapping.component';

describe('BillRateTypeMappingComponent', () => {
  let component: BillRateTypeMappingComponent;
  let fixture: ComponentFixture<BillRateTypeMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillRateTypeMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillRateTypeMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
