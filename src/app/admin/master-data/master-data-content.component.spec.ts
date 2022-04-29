import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDataContentComponent } from './master-data-content.component';

describe('MasterDataContentComponent', () => {
  let component: MasterDataContentComponent;
  let fixture: ComponentFixture<MasterDataContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterDataContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterDataContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
