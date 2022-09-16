import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorScorecardComponent } from './vendor-scorecard.component';

describe('VendorScorecardComponent', () => {
  let component: VendorScorecardComponent;
  let fixture: ComponentFixture<VendorScorecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorScorecardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
