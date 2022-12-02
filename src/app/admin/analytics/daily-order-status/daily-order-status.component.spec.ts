import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyOrderStatusComponent } from './daily-order-status.component';

describe('DailyOrderStatusComponent', () => {
  let component: DailyOrderStatusComponent;
  let fixture: ComponentFixture<DailyOrderStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyOrderStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyOrderStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
