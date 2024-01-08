import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Tour } from 'src/app/models/tour';
import { DataService } from 'src/app/services/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddTourPopupComponent } from 'src/app/components/dialogs/add-tour-popup/add-tour-popup.component'
import { ConfirmationComponent } from 'src/app/components/dialogs/confirmation/confirmation.component';

@Component({
  selector: 'app-tour-list',
  templateUrl: './tour-list.component.html',
  styleUrls: ['./tour-list.component.scss']
})
export class TourListComponent implements OnInit {

  tours: Tour[] = []

  expandedTourId: number | null = null;

  constructor(private dataService: DataService, 
    private router: Router,
    private dialog: MatDialog,
    private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.dataService.getAllTours().subscribe(tours => this.tours = tours);
  }

  navigateToDetailView(tour: Tour) { 
    this.router.navigateByUrl(`tours/${tour.id}`);
  }

  openLocationSelectionPopup() {
    const popup = this.dialog.open(AddTourPopupComponent, { 
      height: '650px',
      width: '550px'
    });

    popup.afterClosed().subscribe(value => {
      if(value) {
        const tour = value as Tour;
        this.saveTour(tour);
      }
    });
  }

  saveTour(tour: Tour) {
    this.dataService.addTour(tour).subscribe(() => {
      this.snackbar.open("Created new tour: " + tour.name, "OK", { duration: 3000 });
      this.tours.push(tour);
    },
    (error: string) => {
      this.snackbar.open("An error occured while creating new tour: " + error, "OK", { duration: 3000 });
    })
  }

  deleteTour(tour: Tour) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {itemName: 'Tour', itemDescription: tour.name}
    });
    dialogRef.afterClosed().subscribe((closeData) => {
      if(closeData) {
        this.dataService.deleteTour(tour.id).subscribe(() => {
          this.snackbar.open('Deleted Tour: '+ tour.name, 'Close', {duration: 4000});
          this.tours = this.tours.filter(t => t !== tour);
        });
      }
    });
  }

  toggleDetails(tourId: number) {
    this.expandedTourId = (this.expandedTourId === tourId) ? null : tourId;
  }
}
