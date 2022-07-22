import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPerDiemCandidatesListComponent } from "./order-per-diem-candidates-list.component";

describe('OrderPerDiemCandidatesListComponent', () => {
  let component: OrderPerDiemCandidatesListComponent;
  let fixture: ComponentFixture<OrderPerDiemCandidatesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderPerDiemCandidatesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderPerDiemCandidatesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
