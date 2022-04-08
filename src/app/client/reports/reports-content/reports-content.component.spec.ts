import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsContentComponent } from './reports-content.component';

describe('ReportsContentComponent', () => {
  let component: ReportsContentComponent;
  let fixture: ComponentFixture<ReportsContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
