import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationComponent } from 'src/app/components/dialogs/confirmation/confirmation.component';
import { OrderTransfer } from 'src/app/models/order';
import { Stolperstein } from 'src/app/models/stolperstein';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';
import { DataService } from 'src/app/services/data/data.service';
import { MapInteractionService } from 'src/app/services/map-interaction/map-interaction.service';
import { AppUtils } from 'src/app/util-config/app-utils';
import { Logger } from 'src/app/util-config/logger';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {

  selectedStolpersteine?: Stolperstein[];
  orderArray: OrderTransfer[] = [];
  location: StolpersteinLocation = {} as StolpersteinLocation;
  locIndex: number = -1;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private mapInteraction: MapInteractionService) { }

  async ngOnInit(): Promise<void> {
    await this.getLocation();
    this.getStolpersteineOf();
  }

  async getLocation() {
    const coords = this.route.snapshot.paramMap.get("coords");
    const allLocations = await this.dataService.getLocations().toPromise()
    const locSelected = allLocations.find(loc => AppUtils.coordinatesToString(loc.coordinates) === coords);
    const locSelectedIndex = allLocations.findIndex(loc => AppUtils.coordinatesToString(loc.coordinates) === coords);
    if (locSelected) {
      this.location = locSelected;
    }
    if (locSelectedIndex) {
      this.locIndex = locSelectedIndex;
    }
  }

  getStolpersteineOf() {
    this.orderArray = [];
    this.dataService.getStolpersteineByLocation(this.location.coordinates).subscribe(stolpersteine => {
      this.selectedStolpersteine = stolpersteine;
      this.selectedStolpersteine.forEach((stein) => {
        this.orderArray.push({ stolperstein_id: stein.id } as OrderTransfer)
      });
    });
  }

  deleteLocation() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: { itemName: 'location', itemDescription: this.location.name }
    });
    dialogRef.afterClosed().subscribe((closeData) => {
      if (closeData) {
        this.dataService.deleteLocation(this.location.coordinates).subscribe(() => {
          this.mapInteraction.removeMapMarker(this.locIndex);
          this.snackbar.open('Deleted location: ' + this.location.name, 'Close', { duration: 4000 }).afterDismissed().subscribe(() => {
            this.router.navigateByUrl('locations');
          });
        }, error => console.error(error));
      }
      return;
    });
  }

  addStolperstein() {
    this.router.navigateByUrl(`locations/stolperstein/add/${this.location.id}`);
  }

  editStolperstein(stolperstein: Stolperstein) {
    this.router.navigateByUrl(`locations/stolperstein/edit/${AppUtils.coordinatesToString(this.location.coordinates)}/${stolperstein.id}`);
  }

  deleteStolperstein(stolperstein: Stolperstein, i: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: { itemName: 'Stolperstein', itemDescription: stolperstein.name }
    });
    dialogRef.afterClosed().subscribe((closeData) => {
      if (closeData) {
        this.dataService.deleteStolperstein(this.location.coordinates, stolperstein.id.toString()).subscribe(() => {
          this.snackbar.open('Deleted stolperstein: ' + stolperstein.name, 'Close', { duration: 4000 });
          this.selectedStolpersteine = this.selectedStolpersteine?.filter((_, index) => index != i);
        });
      }
    });
  }

  dropStolperstein(event: any) {
    if (this.selectedStolpersteine) {
      moveItemInArray(this.selectedStolpersteine, event.previousIndex, event.currentIndex);
      moveItemInArray(this.orderArray, event.previousIndex, event.currentIndex);
      Logger.consoleLog("New Item Order: ", this.orderArray);
    }
  }

  saveStolpersteinOrder() {
    const orderSent: number[] = [];
    this.orderArray.forEach(orderObj => orderSent.push(orderObj.stolperstein_id));
    const requestBody = { order: orderSent };
    this.dataService.updateOrder(this.location.coordinates, requestBody).subscribe((response) => {
      Logger.consoleLog(response);
      this.snackbar.open("Reihenfolge gespeichert!", "Bestätigen", { duration: 4000 });
    }, (error) => {
      Logger.consoleLog(error);
      this.snackbar.open("Ein Fehler ist aufgetreten", "Bestätigen", { duration: 4000 });
    });
  }
}
