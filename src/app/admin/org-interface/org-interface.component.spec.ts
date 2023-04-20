import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgInterfaceComponent } from './org-interface.component';

describe('OrgInterfaceComponent', () => {
  let component: OrgInterfaceComponent;
  let fixture: ComponentFixture<OrgInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgInterfaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
