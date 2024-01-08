import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Tour } from 'src/app/models/tour';


@Component({
  selector: 'app-add-tour-popup',
  templateUrl: './add-tour-popup.component.html',
  styleUrls: ['./add-tour-popup.component.scss']
})
export class AddTourPopupComponent implements OnInit {

  createdTour?: Tour;
  tourForm: FormGroup;

  constructor(private formbuilder: FormBuilder,
    private dialogRef: MatDialogRef<AddTourPopupComponent>,
   ) {
      this.tourForm = this.formbuilder.group({
        'name': ['', [Validators.required, Validators.maxLength(100)]],
        'description': ['', []]
      })
     }

  ngOnInit(): void {
  }

  createTourObject() {
    this.createdTour = {
      id: 0,
      name: this.tourForm.get('name')?.value,
      description: this.tourForm.get('description')?.value
    } as Tour;

    this.dialogRef.close(this.createdTour);
  }
}
