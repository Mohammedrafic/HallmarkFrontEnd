import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderManagementGridComponent } from './order-management-grid.component';

describe('OrderManagementGridComponent', () => {
  let component: OrderManagementGridComponent;
  let fixture: ComponentFixture<OrderManagementGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderManagementGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderManagementGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
