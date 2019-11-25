import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../file.service';
import { FileItem } from '../model/file';
import { v4 } from 'uuid';

export interface DialogData {
  path: string[];
  name: string;
}

@Component({
  selector: 'app-files-dialog',
  templateUrl: './files-dialog.component.html',
  styleUrls: ['./files-dialog.component.scss']
})
export class FilesDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FilesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fileService: FileService
  ) { }

  ngOnInit() {
    this.listFiles();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  listFiles() {
    const query = {
      $and: []
    };

    for (const item of this.data.path) {
      query.$and.push({ path: item });
    }

    const map = new Map<string, any>();

    this.fileService.listFiles(query).subscribe((data) => {
      console.log(data);
      for (let i = 0; i < data.items.length; i++) {
        map.set(v4(), { name: data.items[i], parent: data.items[i - 1] });
      }
    });
  }

}
