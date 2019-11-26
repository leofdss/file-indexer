import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../file.service';
import { FileItem } from '../model/file';

interface DialogData {
  path: string[];
  name: string;
  nivel: number;
}

interface No {
  name: string;
  type: string;
  children?: No[];
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

  files: No[];

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

    const files = {
      name: 'files',
      type: 'folder',
      children: []
    };

    this.fileService.listFiles(query).subscribe((data) => {
      console.log(data);
      let nivel = this.data.nivel;
      for (const file of data.items) {
        this.addFile(file, nivel, files);
      }
      this.files = files.children;
      console.log(this.files);
    });
  }

  addFile(fileItem: FileItem, nivel: number, no: No) {
    if (nivel === fileItem.path.length) {
      const file = {
        name: fileItem.name,
        type: 'file'
      };
      no.children.push(file);
    } else {
      const id = no.children.findIndex(obj => obj.name === fileItem.path[nivel]);
      if (id === -1) {
        const folder = {
          name: fileItem.path[nivel],
          type: 'folder',
          children: []
        };
        nivel++;
        no.children.push(folder);
        this.addFile(fileItem, nivel, no.children[no.children.length - 1]);
      } else {
        nivel++;
        this.addFile(fileItem, nivel, no.children[id]);
      }
    }
  }

}
