import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data/data.service';
import { Tour } from 'src/app/models/tour';
import { TourLocationOrderTransfer } from 'src/app/models/order';
import { Logger } from 'src/app/util-config/logger';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss']
})
export class TourComponent implements OnInit {

  selectedTour?: Tour;
  locationsInTour?: StolpersteinLocation[];
  orderArray: TourLocationOrderTransfer[] = [];


  exapandedLocationId: number | null = null;
  
  constructor(private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
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
      this.getLocations(this.selectedTour.id)
    }
  }

  getLocations(id: number) {
    this.orderArray = [];
    this.dataService.getLocationsInTour(id).subscribe(locs => {
      this.locationsInTour = locs;
      this.locationsInTour.forEach(loc => {
        this.orderArray.push({ location_id: loc.id} as TourLocationOrderTransfer)
        })
      });
    }

  removeLocationFromTour(loc: StolpersteinLocation, index: Number) {

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
