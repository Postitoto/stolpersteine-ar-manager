import { Component, HostListener, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Lifestation } from 'src/app/models/lifestation';
import { Stolperstein } from 'src/app/models/stolperstein';
import { StolpersteinLocation, StolpersteinLocationTransfer } from 'src/app/models/stolpersteinLocation';
import { StolpersteinRelation } from 'src/app/models/stolpersteinRelation';
import { DataService } from 'src/app/services/data/data.service';
import { FileDownloadService } from 'src/app/services/file-download/file-download.service';
import { AppUtils } from 'src/app/util-config/app-utils';
import { Logger } from 'src/app/util-config/logger';
import { ConfirmationComponent } from '../../dialogs/confirmation/confirmation.component';
import { saveAs } from 'file-saver'
import * as moment from 'moment';
import { TextBox } from 'src/app/models/textbox';
import { coordinateRelationship } from 'ol/extent';

@Component({
  selector: 'app-stolperstein-form',
  templateUrl: './stolperstein-form.component.html',
  styleUrls: ['./stolperstein-form.component.scss']
})
export class StolpersteinFormComponent implements OnInit, OnChanges {

  @Input() stolperstein?: Stolperstein;
  @Input() assignedLocation?: StolpersteinLocation;
  @Input() locationFormLoc?: StolpersteinLocationTransfer;
  locationValid: boolean = false;
  stolpersteinBasics: FormGroup;
  stolpersteinAssets: FormGroup;
  stolpersteinTexts: FormGroup;
  stolpersteinRelationsList: StolpersteinRelation[] = [];
  stolpersteinLifeStationsList: Lifestation[] = [];
  stolpersteinTextboxList: TextBox[] = [];
  textFieldWidth: number;
  imagePreviewUrl?: SafeResourceUrl | SafeUrl;
  isFilesChanged = {
    general: false,
    photo: false,
    audio: false
  };
  otherStolpersteine: Stolperstein[] = [];
  isHintHidden = true;
  enterRelation = false;
  enterLifeStation = false;
  enterTextbox = false;
  stolpersteinRelation?: StolpersteinRelation;
  lifeStation?: Lifestation;
  textbox?: TextBox;
  startDateBorn = moment("1900-01-01");
  startDateDied = moment("1942-01-01");
  public persecutionChoices = [
    { key: 'UNKNOWN', displayValue: 'Unbekannt' },
    { key: 'JEWISH', displayValue: 'Jüdische Abstammung' },
    { key: 'POLITICAL', displayValue: 'Politische Gründe' },
    { key: 'HOMOSEXUAL', displayValue: 'Homosexualität' },
    { key: 'OTHER', displayValue: 'Anderer Grund' }];

  constructor(private formbuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private dataService: DataService,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private fileDownload: FileDownloadService) {
    this.textFieldWidth = window.innerWidth * 0.7;
    this.stolpersteinBasics = this.formbuilder.group({
      'name': ['', [Validators.required, Validators.maxLength(100)]],
      'location': ['', Validators.required],
      'birthdate': [],
      'deathdate': [],
      'birthplace': [''],
      'deathplace': [''],
      'reason_for_persecution': ['UNKNOWN']
    });
    this.stolpersteinAssets = this.formbuilder.group({
      'photoName': [''],
      'photo': new FormData(),
      'audioName': [''],
      'audio': new FormData()
    });
    this.stolpersteinTexts = this.formbuilder.group({
      'info_text': [''],
      'family_text': ['']
    });
  }

  ngOnInit(): void {
    Logger.consoleLog("Current Stone:", this.stolperstein)
    this.loadAllStolpersteine();
    if (this.assignedLocation) {
      this.stolpersteinBasics.patchValue({ 'location': this.assignedLocation });
    }
    if (this.stolperstein && this.assignedLocation) {
      if (this.stolperstein.files?.photo) {
        this.imagePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(this.stolperstein.files.photo as string);
      }
      this.stolpersteinBasics.setValue({
        'name': this.stolperstein?.name,
        'location': this.assignedLocation,
        'birthdate': this.stolperstein?.birthdate ? moment(this.stolperstein.birthdate) : null,
        'deathdate': this.stolperstein?.deathdate ? moment(this.stolperstein.deathdate) : null,
        'birthplace': this.stolperstein?.birthplace ? this.stolperstein.birthplace : '',
        'deathplace': this.stolperstein?.deathplace ? this.stolperstein.deathplace : '',
        'reason_for_persecution': this.stolperstein?.reason_for_persecution
      });
      this.stolpersteinAssets.setValue({
        'photoName': this.stolperstein?.files?.photoName ? this.stolperstein.files.photoName : null,
        'photo': this.stolperstein?.files?.photo ? this.stolperstein.files.photo : null,
        'audioName': this.stolperstein?.files?.audioName ? this.stolperstein.files.audioName : null,
        'audio': this.stolperstein?.files?.audio ? this.stolperstein.files.audio : null,
      });
      this.stolpersteinTexts.setValue({
        'info_text': this.stolperstein?.info_text ? this.stolperstein.info_text : '',
        'family_text': this.stolperstein?.family_text ? this.stolperstein.family_text : ''
      });
      this.stolpersteinRelationsList = [] as StolpersteinRelation[];
      if (this.stolperstein.stolperstein_relations) {
        for (let index = 0; index < this.stolperstein.stolperstein_relations.length; index++) {
          const relation = this.stolperstein.stolperstein_relations[index];
          this.stolpersteinRelationsList.push(relation);

        }
      }
      if (this.stolperstein.life_stations) {
        for (let index = 0; index < this.stolperstein.life_stations.length; index++) {
          const life_station = this.stolperstein.life_stations[index];
          this.stolpersteinLifeStationsList.push(life_station)
        }
      }
      if (this.stolperstein.info_textboxes) {
        for (let index = 0; index < this.stolperstein.info_textboxes.length; index++) {
          const textbox = this.stolperstein.info_textboxes[index];
          this.stolpersteinTextboxList.push(textbox);
        }
      }
      this.stolperstein?.stolperstein_relations ?
        this.stolperstein.stolperstein_relations : [];
    }


  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.locationFormLoc){
      this.setLocation(this.locationFormLoc)
    }
      
      console.log(this.stolpersteinBasics)
  }

  @HostListener('window:resize')
  resizeListener(event: any) {
    this.textFieldWidth = window.innerWidth * 0.7;
  }

  getRelationChoice(choice: string) {
    switch (choice) {
      case 'FAMILY':
        return 'Familienmitglied';
      case 'WORK':
        return 'Arbeitskollege';
      case 'FRIEND':
        return 'Freund';
      case 'NEIGHBOUR':
        return 'Nachbar';
      case 'COMMUNITY':
        return 'Gemeinschaft';
      case 'OTHER':
        return 'Anderes';
      default:
        return 'Anderes';
    }
  }

  allValid() {
    return this.stolpersteinBasics.valid
      && this.stolpersteinAssets.valid
      && this.stolpersteinTexts.valid;
  }

  getLocation() {
    return this.stolpersteinBasics.get('location');
  }

  setLocation(value: StolpersteinLocationTransfer) {
    this.stolpersteinBasics.get('location')?.setValue(AppUtils.locTransferToLoc(value));
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    this.imagePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
    if (file) {
      this.stolpersteinAssets.value.photoName = file.name;
      this.stolpersteinAssets.value.photo = file;
      this.isFilesChanged.general = true;
      this.isFilesChanged.photo = true;
    }
  }

  onAudioSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.stolpersteinAssets.value.audio = file;
      this.stolpersteinAssets.value.audioName = file.name;
      this.isFilesChanged.general = true;
      this.isFilesChanged.audio = true;
    }
  }

  audioDownload(event: any) {
    this.fileDownload.downloadFile(this.stolpersteinAssets.value.audio).subscribe(response => {
      saveAs(response, this.stolpersteinAssets.value.audioName)
    });
  }

  saveAndUpload() {
    const protoStolperstein = this.createProtoStolperstein();
    const stolpersteinAssets = this.createStolpersteinAssets();
    Logger.consoleLog("Sent Stolperstein", protoStolperstein);
    this.dataService.addOrUpdateStolperstein(protoStolperstein, this.getLocation()?.value.coordinates).subscribe(async (returnedStolperstein) => {
      Logger.consoleLog('Response: ', returnedStolperstein);
      if (!(returnedStolperstein as Stolperstein).id) {
        console.error("The response is not a valid Stolperstein!");
        return;
      }
      if (this.isFilesChanged.general) {
        const steinId = (returnedStolperstein as Stolperstein).id;
        stolpersteinAssets.append('stolperstein', steinId.toString())
        const response = await this.dataService.uploadStolpersteinAssets((returnedStolperstein as Stolperstein).id, stolpersteinAssets).toPromise();
        Logger.consoleLog("Asset upload returned: ", response);
      }
      let isAdditionalInformation = false;
      const stolperstein = protoStolperstein;
      stolperstein.id = (returnedStolperstein as Stolperstein).id;
      if (this.stolpersteinLifeStationsList.length > 0) {
        isAdditionalInformation = true;
        this.stolpersteinLifeStationsList.forEach(station => station.stolperstein = (returnedStolperstein as Stolperstein).id);
        stolperstein.life_stations = this.stolpersteinLifeStationsList;
      }
      if (this.stolpersteinRelationsList.length > 0) {
        isAdditionalInformation = true;
        this.stolpersteinRelationsList.forEach(relation => relation.stolperstein = (returnedStolperstein as Stolperstein).id);
        stolperstein.stolperstein_relations = this.stolpersteinRelationsList;
      }
      if (this.stolpersteinTextboxList.length > 0) {
        isAdditionalInformation = true;
        this.stolpersteinTextboxList.forEach(box => box.stolperstein = (returnedStolperstein as Stolperstein).id);
        stolperstein.info_textboxes = this.stolpersteinTextboxList;
      }
      if (isAdditionalInformation) {
        const finalStolperstein = await this.dataService.addOrUpdateStolperstein(stolperstein, this.getLocation()?.value.coordinates).toPromise();
        Logger.consoleLog("Final Stolperstein: ", finalStolperstein);
      }
      this.snackbar.open('Stolperstein gespeichert!', 'Schließen', { duration: 4000 });
      this.router.navigateByUrl('/locations');
    },
      (error) => {
        console.error(error);
      });
  }

  setHintHidden() {
    if (!this.isHintHidden) {
      return;
    }
    this.isHintHidden = false;
    setTimeout(() => {
      this.isHintHidden = true;
    }, 6000);
  }

  addNewRelation(newRelation: StolpersteinRelation) {
    if (this.stolperstein) {
      newRelation.stolperstein = this.stolperstein.id;
    }
    if (newRelation.id && newRelation.id > -1) {
      const editIndex = this.stolpersteinRelationsList.findIndex(relation => relation.id === newRelation.id);
      if (editIndex !== -1) {
        this.stolpersteinRelationsList[editIndex] = newRelation;
      }
    } else {
      const editIndex = this.stolpersteinRelationsList.findIndex(relation => relation.tempId === newRelation.tempId);
      if (editIndex > -1) {
        this.stolpersteinRelationsList[editIndex] = newRelation;
      } else {
        this.stolpersteinRelationsList.push(newRelation);
      }
    }
  }

  toggleRelationForm(isEnterRelation: boolean) {
    this.enterRelation = isEnterRelation;
    this.stolpersteinRelation = undefined;
  }

  editRelation(stolpersteinRelation: StolpersteinRelation) {
    this.stolpersteinRelation = stolpersteinRelation;
    this.enterRelation = true;
  }

  deleteRelation(relation: StolpersteinRelation, index: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        itemName: 'Beziehung',
        itemDescription: relation.type + ' mit ' + relation.related_stolperstein.name
      }
    });
    dialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        if (relation.id && relation.id > -1 && this.assignedLocation) {
          this.dataService.deleteRelation(this.assignedLocation?.coordinates, relation.id).subscribe(
            () => {
              this.stolpersteinRelationsList =
                this.stolpersteinRelationsList.filter((_, i) => i != index);
            },
            (error: Response) => {
              Logger.consoleLog(error);
            }
          );
        } else {
          this.stolpersteinRelationsList =
            this.stolpersteinRelationsList.filter((_, i) => i != index);
        }
      }
    });
  }

  toggleLifeStationForm(isEnterLifeStation: boolean) {
    this.enterLifeStation = isEnterLifeStation;
    this.lifeStation = undefined;
  }

  addNewLifeStation(newLifeStation: Lifestation) {
    Logger.consoleLog("received new lifestation", newLifeStation)
    if (newLifeStation.id && newLifeStation.id > -1) {
      const editIndex = this.stolpersteinLifeStationsList.findIndex(lifestation => lifestation.id === newLifeStation.id);
      Logger.consoleLog("life station exists in DB; found local index: ", editIndex);
      if (editIndex !== -1) {
        this.stolpersteinLifeStationsList[editIndex] = newLifeStation;
      }
    } else {
      const editIndex = this.stolpersteinLifeStationsList.findIndex(lifestation => lifestation.tempId === newLifeStation.tempId);
      Logger.consoleLog("life station does not exist in DB; current local index: ", editIndex);
      if (editIndex > -1) {
        this.stolpersteinLifeStationsList[editIndex] = newLifeStation;
      } else {
        this.stolpersteinLifeStationsList.push(newLifeStation);
      }
    }
    this.enterLifeStation = false;
  }

  editLifeStation(lifeStation: Lifestation) {
    this.enterLifeStation = false;
    this.lifeStation = lifeStation;
    this.enterLifeStation = true;
  }

  deleteLifeStation(lifeStation: Lifestation, index: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: { itemName: 'Lebensstation', itemDescription: lifeStation.name + ' bei Koordinaten ' + lifeStation.coordinates }
    });
    dialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        if (lifeStation.id && lifeStation.id > -1 && this.assignedLocation) {
          this.dataService.deleteLifeStation(this.assignedLocation.coordinates, lifeStation.id).subscribe(() => {
            this.stolpersteinLifeStationsList =
              this.stolpersteinLifeStationsList.filter((_, i) => i != index);
          }, (error: Response) => {
            Logger.consoleLog(error);
          });
        } else {
          this.stolpersteinLifeStationsList =
            this.stolpersteinLifeStationsList.filter((_, i) => i != index);
        }
      }
    })
  }

  addTextbox(textbox: TextBox) {
    if (textbox.id && textbox.id > -1) {
      const editIndex = this.stolpersteinTextboxList.findIndex(box => box.id === textbox.id);
      if (editIndex > -1) {
        this.stolpersteinTextboxList[editIndex] = textbox;
      }
    } else {
      const editIndex = this.stolpersteinTextboxList.findIndex(box => box.tempId === textbox.tempId);
      if (editIndex > -1) {
        this.stolpersteinTextboxList[editIndex] = textbox;
      } else {
        this.stolpersteinTextboxList.push(textbox);
      }
    }
  }

  editTextbox(textbox: TextBox) {
    this.textbox = textbox;
    this.enterTextbox = true;
  }

  deleteTextbox(textbox: TextBox, index: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: { itemName: 'Textbox', itemDescription: textbox.title }
    });
    dialogRef.afterClosed().subscribe(isConfirmed => {
      if (isConfirmed) {
        if (textbox.id && textbox.id > -1 && this.assignedLocation) {
          this.dataService.deleteTextbox(this.assignedLocation.coordinates, textbox.id).subscribe(
            () => {
              this.stolpersteinTextboxList = this.stolpersteinTextboxList.filter((_, i) => i != index);
            },
            (error: Response) => {
              Logger.consoleLog(error);
            });
        } else {
          this.stolpersteinTextboxList = this.stolpersteinTextboxList.filter((_, i) => i != index);
        }
      }
    });
  }

  toggleTextboxForm(isEnter: boolean) {
    this.enterTextbox = isEnter;
    this.textbox = undefined;
  }

  sliceLongText(text: string, maxCharacters: number) {
    if (text.length > maxCharacters) {
      return text.slice(0, maxCharacters).concat(' [...]');
    }
    return text;
  }

  // Private Helper Functions
  private createProtoStolperstein() {
    const stolperstein = {
      id: this.stolperstein?.id,
      name: this.stolpersteinBasics.value.name,
      reason_for_persecution: this.stolpersteinBasics.value.reason_for_persecution,
      location: {
        'id': this.stolpersteinBasics.value.location.id,
        'name': this.stolpersteinBasics.value.location.name,
        'coordinates': AppUtils.coordinatesToString(this.stolpersteinBasics.value.location.coordinates)
      } as StolpersteinLocationTransfer,
      birthdate: StolpersteinFormComponent.parseDateToString(this.stolpersteinBasics.value.birthdate),
      deathdate: StolpersteinFormComponent.parseDateToString(this.stolpersteinBasics.value.deathdate),
      birthplace: this.stolpersteinBasics.value.birthplace,
      deathplace: this.stolpersteinBasics.value.deathplace,
      info_text: this.stolpersteinTexts.value.info_text,
      family_text: this.stolpersteinTexts.value.family_text,
    } as Stolperstein;
    return stolperstein;
  }

  private createStolpersteinAssets() {
    const stolpersteinAssets = new FormData();
    if (this.isFilesChanged.general) {
      if (this.isFilesChanged.photo) {
        stolpersteinAssets.append('photoName', this.stolpersteinAssets.value.photoName);
        stolpersteinAssets.append('photo', this.stolpersteinAssets.value.photo);
      }
      if (this.isFilesChanged.audio) {
        stolpersteinAssets.append('audioName', this.stolpersteinAssets.value.audioName);
        stolpersteinAssets.append('audio', this.stolpersteinAssets.value.audio);
      }
    }
    return stolpersteinAssets;
  }

  private loadAllStolpersteine() {
    if (this.assignedLocation) {
      this.dataService.getAllStolpersteine().subscribe(stolpersteine => {
        this.otherStolpersteine = stolpersteine.filter(stein => stein.id != this.stolperstein?.id);
      });
    }
  }

  private static parseDateToString(date: moment.Moment | "" | null): string | null {
    if (date === "" || date === null) {
      return null;
    }
    let dayString, monthString, yearString;
    const day = date.date();
    const month = date.month() + 1; // months are treated as an index 0-11
    const year = date.year();
    dayString = day.toString();
    monthString = month.toString();
    yearString = year.toString();
    if (day < 10) {
      dayString = `0${day.toString()}`;
    }
    if (month < 10) {
      monthString = `0${month.toString()}`;
    }
    return `${yearString}-${monthString}-${dayString}`;
  }
}
