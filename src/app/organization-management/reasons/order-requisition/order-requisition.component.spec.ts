import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRequisitionComponent } from './order-requisition.component';

describe('OrderRequisitionComponent', () => {
  let component: OrderRequisitionComponent;
  let fixture: ComponentFixture<OrderRequisitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderRequisitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderRequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
