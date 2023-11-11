import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocationsPopupComponent } from './add-locations-popup.component';

describe('AddLocationsPopupComponent', () => {
  let component: AddLocationsPopupComponent;
  let fixture: ComponentFixture<AddLocationsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLocationsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLocationsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
