import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { Coordinates } from 'src/app/models/coordinates';
import { StolpersteinLocation, StolpersteinLocationTransfer } from 'src/app/models/stolpersteinLocation';
import { DataService } from 'src/app/services/data/data.service';
import { MapInteractionService } from 'src/app/services/map-interaction/map-interaction.service';
import { AppUtils } from 'src/app/util-config/app-utils';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {

  isVisible = false;
  isAddStolperStein = false;
  selectedLocation?: StolpersteinLocationTransfer;
  locations: StolpersteinLocation[];
  locationCoordinates?: Coordinates[];
  coordinatesForForm?: Coordinates;
  constructor(private dataService: DataService,
    private mapInteraction: MapInteractionService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,) {
    this.locations = [];
  }

  ngOnInit(): void {
    this.dataService.getLocations().subscribe(locs => {
      this.locations = locs;
      this.locationCoordinates = this.locations.map(loc => loc.coordinates);
    })
  }

  toggleLocationForm() {
    this.isVisible = !this.isVisible;
  }

  addLocationToList(newLocation: StolpersteinLocationTransfer) {
    const newLocationEntity = AppUtils.locTransferToLoc(newLocation);
    this.dataService.getLocations().subscribe(allLocations => {
      const savedLocation = allLocations.find(loc => AppUtils.isCoordinatesEqual(loc.coordinates, newLocationEntity.coordinates));
      if (savedLocation) {
        this.mapInteraction.addMapMarker(Number.parseFloat(savedLocation.coordinates.longitude),
          Number.parseFloat(savedLocation.coordinates.latitude));
        this.locations.push(savedLocation);

        if (this.isAddStolperStein){
          this.addStolperStein(savedLocation)
        }
      }
      this.isVisible = false;
    });
  }

  setAddStolperStein(value: boolean){
    this.isAddStolperStein = value;
  }

  addStolperStein(location: StolpersteinLocation){
    this.router.navigate(['stolperstein/add', location.id], {relativeTo: this.route});
  }
}
