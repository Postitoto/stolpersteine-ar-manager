import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';

@Component({
  selector: 'app-add-locations-popup',
  templateUrl: './add-locations-popup.component.html',
  styleUrls: ['./add-locations-popup.component.scss']
})
export class AddLocationsPopupComponent {

  locations?: StolpersteinLocation[]
  selectedLocations: StolpersteinLocation[] = []; 

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
      this.locations = data.locations;
  }

  toggleLocationSelection(location: StolpersteinLocation) : void {
    if(this.isSelected(location)) {
      this.selectedLocations = this.selectedLocations?.filter(l => l !== location);
    } else {
      this.selectedLocations?.push(location);
    }
  }

  isSelected(location: StolpersteinLocation) : boolean {
    return this.selectedLocations?.includes(location);
  }
}
