import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeSettingsComponent } from './fee-settings.component';

describe('FeeSettingsComponent', () => {
  let component: FeeSettingsComponent;
  let fixture: ComponentFixture<FeeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeeSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
