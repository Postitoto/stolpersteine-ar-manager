import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTourPopupComponent } from './add-tour-popup.component';

describe('AddTourPopupComponent', () => {
  let component: AddTourPopupComponent;
  let fixture: ComponentFixture<AddTourPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTourPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTourPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
