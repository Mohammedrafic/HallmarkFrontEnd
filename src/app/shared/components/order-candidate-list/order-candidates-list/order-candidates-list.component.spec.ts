import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCandidatesListComponent } from './order-candidates-list.component';

describe('OrderCandidatesListComponent', () => {
  let component: OrderCandidatesListComponent;
  let fixture: ComponentFixture<OrderCandidatesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCandidatesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCandidatesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
