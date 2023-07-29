import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Stolperstein } from 'src/app/models/stolperstein';
import { StolpersteinRelation } from 'src/app/models/stolpersteinRelation';
import { Logger } from 'src/app/util-config/logger';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-relation-form',
  templateUrl: './relation-form.component.html',
  styleUrls: ['./relation-form.component.scss']
})
export class RelationFormComponent implements OnInit {

  @Input() relation?: StolpersteinRelation;
  @Input() otherStolpersteine: Stolperstein[] = [];
  @Input() textFieldWidth = 100;
  @Output() newRelation = new EventEmitter<StolpersteinRelation>();
  @Output() closeForm = new EventEmitter<boolean>();
  stolpersteinRelationForm: FormGroup;
  typeChoices = [
    {key: 'FAMILY', showValue: 'Familienmitglied'}, 
    {key: 'WORK', showValue: 'Arbeitskollege'}, 
    {key: 'FRIEND', showValue: 'Freund'}, 
    {key: 'NEIGHBOUR', showValue: 'Nachbar'}, 
    {key: 'COMMUNITY', showValue: 'Gemeinschaft'}, 
    {key: 'OTHER', showValue: 'Anderes'}
  ];
  constructor(private formbuilder: FormBuilder) { 
    this.stolpersteinRelationForm = this.formbuilder.group({
      'id': [-1],
      'related_stolperstein': [, Validators.required],
      'stolperstein': [-1],
      'text': [],
      'type': ['', Validators.required]
    }) 
  }

  ngOnInit(): void {
    if (this.relation) {
      const relStolperstein = this.otherStolpersteine.find(stein => {
        return stein.name === this.relation?.related_stolperstein.name &&
          stein.location.coordinates === this.relation?.related_stolperstein.location.coordinates
      });
      this.stolpersteinRelationForm.patchValue({
        'id': this.relation.id,
        'stolperstein': this.relation.stolperstein,
        'related_stolperstein': relStolperstein,
        'text': this.relation.text,
        'type': this.relation.type
      });
    }
  }

  emitSaveRelation() {
    const newRelation = {
      'id': this.relation?.id ? this.relation.id : -1, // not filled in here
      'related_stolperstein': this.stolpersteinRelationForm.value.related_stolperstein,
      'stolperstein': this.relation?.stolperstein, // not filled in here
      'text': this.stolpersteinRelationForm.value.text,
      'type': this.stolpersteinRelationForm.value.type
    } as StolpersteinRelation;
    if (this.stolpersteinRelationForm.value.id < 0 && !this.relation?.tempId) {
      newRelation.tempId = uuidv4();
      Logger.consoleLog("Created New Relation with temp UUID", newRelation.tempId);
    } else if (this.relation?.tempId) {
      newRelation.tempId = this.relation.tempId;
      Logger.consoleLog("Edited existing unsaved Relation with temp UUID", newRelation.tempId);
    } else {
      Logger.consoleLog("Edited existing in DB saved Relation with ID", newRelation.id);
    }
    this.newRelation.emit(newRelation);
    this.emitCancel();
  }

  emitCancel() {
    this.closeForm.emit(false);
  }


}
