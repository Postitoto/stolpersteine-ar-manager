import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StolpersteinLocationTransfer } from 'src/app/models/stolpersteinLocation';
import { DataService } from 'src/app/services/data/data.service';
import { MapInteractionService } from 'src/app/services/map-interaction/map-interaction.service';


@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss']
})
export class LocationFormComponent implements OnInit{

  locationForm: FormGroup;
  @Output() locationEmitter = new EventEmitter()
  @Output() addStolperSteinEmitter = new EventEmitter()

  constructor(private formbuilder: FormBuilder,
              private dataService: DataService,
              private snackbar: MatSnackBar,
              private mapInteraction: MapInteractionService,) { 
    this.locationForm = this.formbuilder.group({
      'name': ['', [Validators.required, Validators.maxLength(100)]],
      'coordinates_lat': ['', [Validators.required, Validators.maxLength(18)]],
      'coordinates_lon': ['', [Validators.required, Validators.maxLength(19)]],
    });
  }
  
  ngOnInit(): void {
    this.mapInteraction.getCoordinates().subscribe(coordinates => {
      this.locationForm.setValue({
        'name': this.locationForm.get('name')?.value, 
        'coordinates_lat': coordinates.latitude, 
        'coordinates_lon': coordinates.longitude,
      });
    })
  }

  addStolperStein(){
    this.addStolperSteinEmitter.emit(true);
    this.saveAndSend();
  }

  saveAndSend() {
    const newLocation = {
      name: this.locationForm.get('name')?.value,
      coordinates: this.locationForm.get('coordinates_lat')?.value + ',' + this.locationForm.get('coordinates_lon')?.value
    } as StolpersteinLocationTransfer;

    this.dataService.addLocation(newLocation).subscribe(() => {
      this.locationEmitter.emit(newLocation);
      this.snackbar.open('Added location '+newLocation.name, 'Close', {duration: 4000});
    },
    (error: string) => {
      this.snackbar.open('Could not create location. Error: '+error, 'Close', {duration: 4000});
    });
  }
}
