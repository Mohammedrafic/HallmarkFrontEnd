import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaborUtilizationComponent } from './labor-utilization.component';

describe('LaborUtilizationComponent', () => {
  let component: LaborUtilizationComponent;
  let fixture: ComponentFixture<LaborUtilizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaborUtilizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaborUtilizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
