import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCandidatesContainerComponent } from './order-candidates-container.component';

describe('OrderDetailsFormComponent', () => {
  let component: OrderCandidatesContainerComponent;
  let fixture: ComponentFixture<OrderCandidatesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCandidatesContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCandidatesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
