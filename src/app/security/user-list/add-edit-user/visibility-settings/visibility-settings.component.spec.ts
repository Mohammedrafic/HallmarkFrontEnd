import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisibilitySettingsComponent } from './visibility-settings.component';

describe('VisibilitySettingsComponent', () => {
  let component: VisibilitySettingsComponent;
  let fixture: ComponentFixture<VisibilitySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisibilitySettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisibilitySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
