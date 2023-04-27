import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgInterfaceConfigurationComponent } from './org-interface-configuration.component';

describe('OrgInterfaceConfigurationComponent', () => {
  let component: OrgInterfaceConfigurationComponent;
  let fixture: ComponentFixture<OrgInterfaceConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgInterfaceConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgInterfaceConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
