import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictedContractLaborSpentComponent } from './predicted-contract-labor-spent.component';

describe('PredictedContractLaborSpentComponent', () => {
  let component: PredictedContractLaborSpentComponent;
  let fixture: ComponentFixture<PredictedContractLaborSpentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictedContractLaborSpentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictedContractLaborSpentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
