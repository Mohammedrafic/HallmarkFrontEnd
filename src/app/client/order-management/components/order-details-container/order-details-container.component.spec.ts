import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailsContainerComponent } from './order-details-container.component';

describe('OrderDetailsFormComponent', () => {
  let component: OrderDetailsContainerComponent;
  let fixture: ComponentFixture<OrderDetailsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderDetailsContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
