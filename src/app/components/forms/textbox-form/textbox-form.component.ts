import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TextBox } from 'src/app/models/textbox';
import { Logger } from 'src/app/util-config/logger';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-textbox-form',
  templateUrl: './textbox-form.component.html',
  styleUrls: ['./textbox-form.component.scss']
})
export class TextboxFormComponent implements OnInit {

  @Input() textbox?: TextBox;
  @Input() textFieldWidth = 100;
  @Output() newTextbox = new EventEmitter<TextBox>();
  @Output() closeForm = new EventEmitter<boolean>();

  stolpersteinTextboxForm: FormGroup;
  constructor(private formbuilder: FormBuilder) {
    this.stolpersteinTextboxForm = this.formbuilder.group({
      'id': [-1],
      'title': [, Validators.required],
      'content': [, Validators.required],
    });  
  }

  ngOnInit(): void {
    if (this.textbox) {
      this.stolpersteinTextboxForm.patchValue({
        'id': this.textbox.id,
        'title': this.textbox.title,
        'content': this.textbox.content,
      });
    }
  }

  emitSaveTextbox() {
    const textbox = {
      'id': this.stolpersteinTextboxForm.value.id ? this.stolpersteinTextboxForm.value.id : -1,
      'title': this.stolpersteinTextboxForm.value.title,
      'content': this.stolpersteinTextboxForm.value.content
    } as TextBox;
    // entirely new textbox
    if (this.stolpersteinTextboxForm.value.id < 0 && !this.textbox?.tempId) {
      textbox.tempId = uuidv4();
      Logger.consoleLog("Textbox created with temp id "+textbox.tempId);
    }
    // textbox was created before and already has a temp id 
    else if (this.textbox?.tempId){
      textbox.tempId = this.textbox.tempId;
      Logger.consoleLog("Textbox created before, assigning existing temp id "+this.textbox.tempId);
    }
    // textbox was already saved to db and therefore has a valid id
    else {
      Logger.consoleLog("Textbox exists in DB with ID "+this.textbox?.id);
    }
    this.newTextbox.emit(textbox);
    this.emitCancel();
  }

  emitCancel() {
    this.closeForm.emit(false);
  }
}
