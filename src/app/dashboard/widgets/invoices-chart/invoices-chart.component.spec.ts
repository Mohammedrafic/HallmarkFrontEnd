import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesChartComponent } from './invoices-chart.component';

describe('InvoicesChartComponent', () => {
  let component: InvoicesChartComponent;
  let fixture: ComponentFixture<InvoicesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicesChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
