import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCredentialsFormComponent } from './map-credentials-form.component';

describe('MapCredentialsComponent', () => {
  let component: MapCredentialsFormComponent;
  let fixture: ComponentFixture<MapCredentialsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapCredentialsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapCredentialsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
