import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Lifestation } from 'src/app/models/lifestation';
import { Stolperstein } from 'src/app/models/stolperstein';
import { MapInteractionService } from 'src/app/services/map-interaction/map-interaction.service';
import { AppUtils } from 'src/app/util-config/app-utils';
import { Logger } from 'src/app/util-config/logger';
import { v4 as uuidv4 } from 'uuid';
import { MapPopupComponent } from '../../dialogs/map-popup/map-popup.component';
import { MapViewComponent } from '../../map-view/map-view.component';
@Component({
  selector: 'app-life-station-form',
  templateUrl: './life-station-form.component.html',
  styleUrls: ['./life-station-form.component.scss']
})
export class LifeStationFormComponent implements OnInit {
  @Input() lifeStation?: Lifestation;
  @Input() empty?: boolean;
  @Input() stolperstein?: Stolperstein;
  @Input() textFieldWidth: number;
  @Output() closeForm = new EventEmitter()
  @Output() newLifeStation = new EventEmitter()

  stolpersteinLifeStationForm: FormGroup;
  constructor(private formbuilder: FormBuilder,
              private dialog: MatDialog) { 
    this.textFieldWidth = 0;
    this.stolpersteinLifeStationForm = this.formbuilder.group({
      'id': [-1],
      'coordinates': ['', [Validators.required]],
      'name': [''],
      'stolperstein': [-1],
      'text': ['']
    });
  }

  ngOnInit(): void {
    console.log(this.stolperstein, this.lifeStation);
    this.setFormValues();
    
  }

  openCoordinateSelection() {
    const dialogRef = this.dialog.open(MapPopupComponent);
    dialogRef.afterClosed().subscribe(coordinates => {
      if (coordinates) {
        this.stolpersteinLifeStationForm.patchValue({'coordinates': AppUtils.coordinatesToString(coordinates)});
      } 
    })
  }

  emitSaveLifeStation() {
    const newLifeStation = {   
      id: this.stolpersteinLifeStationForm.value.id,  
      coordinates: this.stolpersteinLifeStationForm.value.coordinates,
      stolperstein: this.stolpersteinLifeStationForm.value.stolperstein,
      name : this.stolpersteinLifeStationForm.value.name,
      text: this.stolpersteinLifeStationForm.value.text,
      
    } as Lifestation;
    if (this.stolpersteinLifeStationForm.value.id < 0 && !this.lifeStation?.tempId) {
      newLifeStation.tempId = uuidv4();
      console.log('generated UUID for new life station ', newLifeStation.tempId);
    } else if (this.lifeStation?.tempId) {
      newLifeStation.tempId = this.lifeStation?.tempId;
    }
    Logger.consoleLog("saved life station ", newLifeStation);
    this.newLifeStation.emit(newLifeStation);
  }

  emitCancel() {
    this.closeForm.emit(false);
  }

  private setFormValues() {
    if (this.lifeStation) {
      this.stolpersteinLifeStationForm.patchValue({
        'id': this.lifeStation.id,
        'coordinates': this.lifeStation.coordinates,
        'name': this.lifeStation.name,
        'text': this.lifeStation.text
      });
    }
    if (this.stolperstein) {
      this.stolpersteinLifeStationForm.patchValue({
        'stolperstein': this.stolperstein.id
      });
    } 
  }
}
