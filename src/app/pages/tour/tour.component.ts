import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data/data.service';
import { Tour, TourLocation } from 'src/app/models/tour';
import { TourLocationOrderTransfer } from 'src/app/models/order';
import { Logger } from 'src/app/util-config/logger';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddLocationsPopupComponent } from 'src/app/components/dialogs/add-locations-popup/add-locations-popup.component';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent implements OnInit {

  selectedTour?: Tour;

  tourLocations: TourLocation[] = [];
  editedTourLocations: TourLocation[] = [];

  initialLocations: StolpersteinLocation[] = [];
  locationsInTour: StolpersteinLocation[] = [];
  locationsOutsideTour: StolpersteinLocation[] = [];

  orderArray: TourLocationOrderTransfer[] = [];
 
  exapandedLocationId: number | null = null;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar) { }

  ngOnInit(): void {
      this.getTour();
  }

  async getTour() {
    const idString = this.route.snapshot.paramMap.get("id");
    const id = Number(idString);
    const tour = await this.dataService.getTourById(id).toPromise();

    if(tour) {
      this.selectedTour = tour;
      this.getLocations()
    }
  }

  getLocations() {
    this.orderArray = [];

    if(this.selectedTour) {
      this.dataService.getLocationsInTour(this.selectedTour.id).subscribe(locations => {
        this.initialLocations = locations as StolpersteinLocation[];
        this.initialLocations.forEach(entry => this.locationsInTour.push(entry));

        this.dataService.getLocations().subscribe(allLocations => {
          const ids = this.initialLocations.map(loc => loc.id);
          this.locationsOutsideTour = allLocations.filter(loc => !ids.includes(loc.id));
        })
      });

      this.dataService.getTourLocations(this.selectedTour.id).subscribe(tourLocs => {
        this.parseTourLocation(tourLocs);
      });
    }
  }

  openLocationSelectionPopup() {
    const data = {
      locations: this.locationsOutsideTour
    }

    const popup = this.dialog.open(AddLocationsPopupComponent, { 
      height: '400px',
      width: '400px',
      data: data 
    });

    popup.afterClosed().subscribe(value => {
      if(value) {
        const locations = value as StolpersteinLocation[];
        this.addLocationsToTour(locations);
        
      }
    });
  }

  addLocationsToTour(selectedLocations: StolpersteinLocation[]): void {
    selectedLocations.forEach(loc => this.locationsInTour.push(loc));
    this.locationsOutsideTour = this.locationsOutsideTour.filter(loc => !this.locationsInTour.includes(loc));
  }

  removeLocationFromTour(location: StolpersteinLocation) {
    this.locationsInTour = this.locationsInTour.filter(l => l !== location);
    this.locationsOutsideTour.push(location);
  }

  toggleDetails(locId: number) {
    this.exapandedLocationId = (this.exapandedLocationId === locId) ? null : locId;
  }

  dropLocation(event: any) {
    if (this.selectedTour?.locations) {
      moveItemInArray(this.selectedTour.locations, event.previousIndex, event.currentIndex);
      moveItemInArray(this.orderArray, event.previousIndex, event.currentIndex);
      Logger.consoleLog("New Item Order: ", this.orderArray);
    }
  }

  saveSelection() {
    if(this.selectedTour) {
      // Array of locations that have been added
      const addedIds = this.locationsInTour.filter(loc => !this.initialLocations.includes(loc)).map(loc => loc.id);
      addedIds.forEach(id => this.addTourLocationObject(id))

      // Array of locations that have been removed
      const removedIds = this.initialLocations.filter(loc => !this.locationsInTour.includes(loc)).map(loc => loc.id);
      removedIds?.forEach(id => this.removeTourLocationObject(id))

      // We need to call this only when there's actually been data that changed
      if(addedIds.length > 0 || removedIds.length > 0) {
        this.dataService.editTourLocations(this.selectedTour?.id, this.editedTourLocations).subscribe(response => {
          console.log(response);
          this.router.navigateByUrl('tours/list');
        })
      }
      else {
        this.snackbar.open("Es wurden keine Änderungen vorgenommen", "Okay", {duration: 3000});
      }
    }
  }

  addTourLocationObject(locationId: number): void {
    const tourLocation = this.tourLocations.find(tl => tl.location_id === locationId)

    if(tourLocation) {
      tourLocation.is_active = true;
      this.editedTourLocations.push(tourLocation);
    }
    else if (this.selectedTour) {
      const newTourLocation: TourLocation = {
        id: 0, // This is necessary to inialize but the backend will over write this when saving it to the database
        tour_id: this.selectedTour?.id,
        location_id: locationId,
        order: 1,
        is_active: true,
      };

      this.editedTourLocations.push(newTourLocation);
    }
  }

  removeTourLocationObject(locationId: number): void {
    const tourLocation = this.tourLocations.find(tl => tl.location_id === locationId)

    if(tourLocation) {
      tourLocation.is_active = false;
      this.editedTourLocations.push(tourLocation);
    }
  }

  parseTourLocation(response: any[]): void  {
    response.forEach(r => {
      const tourLocation: TourLocation = {
        id: r.id,
        tour_id: r.tour,
        location_id: r.location,
        order: r.order,
        is_active: r.is_active,
      };

      this.tourLocations.push(tourLocation);
    })
  }

  saveLocationOrder() {
    const orderSent: number[] = [];
    this.orderArray.forEach(orderObj => orderSent.push(orderObj.location_id));
    const requestBody = { order: orderSent };
    /*this.dataService.updateOrder(this.location.coordinates, requestBody).subscribe((response) => {
      Logger.consoleLog(response);
      this.snackbar.open("Reihenfolge gespeichert!", "Bestätigen", { duration: 4000 });
    }, (error) => {
      Logger.consoleLog(error);
      this.snackbar.open("Ein Fehler ist aufgetreten", "Bestätigen", { duration: 4000 });
    });*/
  }

}
