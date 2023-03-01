import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencypositionWidgetComponent } from './agencyposition-widget.component';

describe('AgencypositionWidgetComponent', () => {
  let component: AgencypositionWidgetComponent;
  let fixture: ComponentFixture<AgencypositionWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgencypositionWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgencypositionWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
