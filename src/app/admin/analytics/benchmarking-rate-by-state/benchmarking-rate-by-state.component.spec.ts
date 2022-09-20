import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenchmarkingRateByStateComponent } from './benchmarking-rate-by-state.component';

describe('BenchmarkingRateByStateComponent', () => {
  let component: BenchmarkingRateByStateComponent;
  let fixture: ComponentFixture<BenchmarkingRateByStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenchmarkingRateByStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenchmarkingRateByStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
