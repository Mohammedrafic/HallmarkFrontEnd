import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderMappingComponent } from './purchase-order-mapping.component';

describe('PurchaseOrderMappingComponent', () => {
  let component: PurchaseOrderMappingComponent;
  let fixture: ComponentFixture<PurchaseOrderMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseOrderMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
