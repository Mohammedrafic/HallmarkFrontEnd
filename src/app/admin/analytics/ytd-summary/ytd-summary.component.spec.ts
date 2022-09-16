import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YtdSummaryComponent } from './ytd-summary.component';

describe('YtdSummaryComponent', () => {
  let component: YtdSummaryComponent;
  let fixture: ComponentFixture<YtdSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YtdSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YtdSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
