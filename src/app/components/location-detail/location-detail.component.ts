import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderTransfer } from 'src/app/models/order';
import { Stolperstein } from 'src/app/models/stolperstein';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';
import { DataService } from 'src/app/services/data/data.service';
import { MapInteractionService } from 'src/app/services/map-interaction/map-interaction.service';
import { AppUtils } from 'src/app/util-config/app-utils';
import { Logger } from 'src/app/util-config/logger';
import { ConfirmationComponent } from '../dialogs/confirmation/confirmation.component';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.scss']
})
export class LocationDetailComponent{

  @Input() location: StolpersteinLocation;
  @Input() locIndex: number;
  selectedStolpersteine?: Stolperstein[];
  showStolpersteineList = false;
  orderArray: OrderTransfer[] = [];
  constructor(private dataService: DataService,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              private router: Router,
              private route: ActivatedRoute,
              private mapInteraction: MapInteractionService) { 
                this.location = {} as StolpersteinLocation;
                this.locIndex = -1;
              }

  onPanelOpen() {
    this.selectedStolpersteine = [];
    this.orderArray = [];
    this.showStolpersteineList = false; 
    this.getStolpersteineOf();
  }

  getStolpersteineOf() {
    this.orderArray = [];
    this.dataService.getStolpersteineByLocation(this.location.coordinates).subscribe(stolpersteine => {
      this.selectedStolpersteine = stolpersteine;
      this.selectedStolpersteine.forEach((stein) => {
        this.orderArray.push({stolperstein_id: stein.id} as OrderTransfer)
      })
      this.showStolpersteineList = true;
    });
  }

  deleteLocation() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {itemName: 'location', itemDescription: this.location.name}
    });
    dialogRef.afterClosed().subscribe((closeData) => {
      if (closeData) {
        this.dataService.deleteLocation(this.location.coordinates).subscribe(() => {
          this.mapInteraction.removeMapMarker(this.locIndex);
          this.snackbar.open('Deleted location: '+this.location.name, 'Close', {duration: 4000});
          // this.location = this.location.filter((_, index) => index != i);
        }, error => console.error(error));
      } 
      return;
    });
  }

  addStolperstein() {
    this.router.navigate(['stolperstein/add', this.location.id], {relativeTo: this.route});
  }

  editStolperstein(stolperstein: Stolperstein) {
    this.router.navigate(['stolperstein/edit', AppUtils.coordinatesToString(this.location.coordinates), stolperstein.id], {relativeTo: this.route});
  }

  deleteStolperstein(stolperstein: Stolperstein, i: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {itemName: 'Stolperstein', itemDescription: stolperstein.name}
    });
    dialogRef.afterClosed().subscribe((closeData) => {
      if(closeData) {
        this.dataService.deleteStolperstein(this.location.coordinates, stolperstein.id.toString()).subscribe(() => {
          this.snackbar.open('Deleted stolperstein: '+stolperstein.name, 'Close', {duration: 4000});
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
    const requestBody = {order: orderSent};
    this.dataService.updateOrder(this.location.coordinates, requestBody).subscribe((response) => {
      Logger.consoleLog(response);
    }, (error) => Logger.consoleLog(error));
  }
}
