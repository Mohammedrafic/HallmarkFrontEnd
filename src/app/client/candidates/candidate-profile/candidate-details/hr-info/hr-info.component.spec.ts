import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrInfoComponent } from './hr-info.component';

describe('HrInfoComponent', () => {
  let component: HrInfoComponent;
  let fixture: ComponentFixture<HrInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HrInfoComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
