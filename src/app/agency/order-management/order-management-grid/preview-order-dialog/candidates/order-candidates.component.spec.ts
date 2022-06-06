import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCandidatesComponent } from './order-candidates.component';

describe('CandidatesComponent', () => {
  let component: OrderCandidatesComponent;
  let fixture: ComponentFixture<OrderCandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCandidatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
