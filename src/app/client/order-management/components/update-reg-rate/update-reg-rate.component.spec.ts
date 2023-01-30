import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRegRateComponent } from './update-reg-rate.component';

describe('UpdateRegRateComponent', () => {
  let component: UpdateRegRateComponent;
  let fixture: ComponentFixture<UpdateRegRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateRegRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateRegRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
