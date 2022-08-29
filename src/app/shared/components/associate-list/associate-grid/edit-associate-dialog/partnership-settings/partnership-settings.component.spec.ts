import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnershipSettingsComponent } from './partnership-settings.component';

describe('PartnershipSettingsComponent', () => {
  let component: PartnershipSettingsComponent;
  let fixture: ComponentFixture<PartnershipSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnershipSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnershipSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
