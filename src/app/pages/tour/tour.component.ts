import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data/data.service';
import { Tour, TourLocation, TourLocationAudio } from 'src/app/models/tour';
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
  tourLocationsFinal: TourLocation[] = [];

  initialLocations: StolpersteinLocation[] = [];
  locationsInTour: StolpersteinLocation[] = [];
  locationsOutsideTour: StolpersteinLocation[] = [];

  orderArray: TourLocationOrderTransfer[] = [];
 
  locationAudios: TourLocationAudio[] = [];

  expandedLocationId: number | null = null;
  expandedAudio: TourLocationAudio | undefined;

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
    if(this.expandedLocationId === locId) {
      this.expandedLocationId = null;
      this.expandedAudio = undefined;
    } else {
      this.expandedLocationId =  locId;
      this.expandedAudio = this.locationAudios.find(x => x.location_id === this.expandedLocationId)
    }
  }

  onAudioSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if(this.expandedAudio) {
          this.expandedAudio.audioFile = file;
          this.expandedAudio.audioName = file.name;
      } else {
        const locAudio: TourLocationAudio = {
          location_id: this.expandedLocationId,
          audioName: file.name,
          audioFile: file,
        };
        this.locationAudios.push(locAudio);
      }
    }
  }

  dropLocation(event: any) {
    moveItemInArray(this.locationsInTour, event.previousIndex, event.currentIndex);
    moveItemInArray(this.orderArray, event.previousIndex, event.currentIndex);
    Logger.consoleLog("New Item Order: ", this.orderArray);
  }

  saveSelection() {
    if(this.selectedTour) {
      // Adds a new TourLocation object to the request body for each location currently in the tour
      this.locationsInTour.forEach(loc => this.addTourLocationObject(loc));

      // Since the backend doesn't delete entries in the look up table but just sets them inactive
      // we need to create a TourLocation object for each removed location aswell.
      // All this does is set_active to False and set the order to 0
      const removed = this.initialLocations.filter(loc => !this.locationsInTour.includes(loc));
      removed.forEach(loc => this.removeTourLocationObject(loc))

      this.sendRequest(this.tourLocationsFinal);
    }
  }

  sendRequest(data: TourLocation[]) {
    const formData = new FormData();

    data.forEach((tourLocation, index) => {
      // Append fields to the FormData for each TourLocation
      formData.append(`tour_${index}`, tourLocation.tour_id.toString());
      formData.append(`location_${index}`, tourLocation.location_id.toString());
      formData.append(`id_${index}`, tourLocation.id.toString());
      formData.append(`order_${index}`, tourLocation.order.toString());
      formData.append(`is_active_${index}`, tourLocation.is_active.toString());

      if(tourLocation.audioFile) {
        formData.append(`audioName_${index}`, tourLocation.audioFile.name);
        formData.append(`audio_${index}`, tourLocation.audioFile);
      }
    });

    if(this.selectedTour) {
      this.dataService.editTourLocations(this.selectedTour?.id, formData).subscribe(response => {
        this.snackbar.open("Änderungen wurden übernommen.", "Okay", {duration: 3000});
        this.router.navigateByUrl('tours/list');
      });
    }
   
  }
  
  addTourLocationObject(location: StolpersteinLocation): void {
    const order = this.locationsInTour.indexOf(location) + 1;
    const tourLocation = this.tourLocations.find(tl => tl.location_id === location.id)
    const audio = this.locationAudios.find(x => x.location_id === location.id)

    if(tourLocation) {
      tourLocation.order = order;
      tourLocation.audioFile = audio?.audioFile;
      tourLocation.is_active = true;
      this.tourLocationsFinal.push(tourLocation);
    }
    else if (this.selectedTour) {
      const newTourLocation: TourLocation = {
        id: 0, // This is necessary to inialize but the backend will over write this when saving it to the database
        tour_id: this.selectedTour?.id,
        location_id: location.id,
        audioFile: audio?.audioFile,
        order: order,
        is_active: true,
      };

      this.tourLocationsFinal.push(newTourLocation);
    }
  }

  removeTourLocationObject(location: StolpersteinLocation): void {
    const tourLocation = this.tourLocations.find(tl => tl.location_id === location.id)

    if(tourLocation) {
      tourLocation.is_active = false;
      tourLocation.order = 0;
      this.tourLocationsFinal.push(tourLocation);
    }
  }

  parseTourLocation(response: any[]): void  {
    response.forEach(r => {
      const tourLocation: TourLocation = {
        id: r.id,
        tour_id: r.tour,
        location_id: r.location,
        audioFile: r.audio,
        order: r.order,
        is_active: r.is_active,
      };

      const locAudio: TourLocationAudio = {
        location_id: r.location,
        audioName: r.audioName,
        audioFile: r.audio,
      };

      this.tourLocations.push(tourLocation);
      this.locationAudios.push(locAudio);
    })
  }
}
