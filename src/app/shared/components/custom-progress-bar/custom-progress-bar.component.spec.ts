import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomProgressBarComponent } from './custom-progress-bar.component';

describe('CustomProgressBarComponent', () => {
  let component: CustomProgressBarComponent;
  let fixture: ComponentFixture<CustomProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomProgressBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
