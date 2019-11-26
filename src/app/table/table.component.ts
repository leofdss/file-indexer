import { AfterViewInit, Component, OnInit, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FilesDialogComponent } from '../files-dialog/files-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { catchError, switchMap, debounceTime, filter, distinctUntilChanged, startWith, map } from 'rxjs/operators';
import { of, merge, Subscription } from 'rxjs';
import { FileService } from '../file.service';
import { FileItem } from '../model/file';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'path', 'files'];
  sub: Subscription = new Subscription();

  listEmitter: EventEmitter<any> = new EventEmitter();
  selection = new SelectionModel<FileItem>(true, []);

  loading = false;

  searchField = new FormControl();
  data = [];
  query = {};
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(
    public dialog: MatDialog,
    private fileService: FileService
  ) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.list();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  list() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.searchField.valueChanges.subscribe(() => {
      this.paginator.pageIndex = 0;
    });
    this.sub.add(merge(this.sort.sortChange, this.paginator.page, this.searchField.valueChanges)
      .pipe(
        startWith({}),
        filter(value => (typeof value === 'string' && value.length > 1) || typeof value !== 'string' || value === ''),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap(() => {
          this.isLoadingResults = true;
          let search = '';
          if (this.searchField.value) {
            search = this.searchField.value.trim().toLowerCase();
          }
          return this.fileService.listFilesTable({
            query: this.query,
            sort: this.sort.active,
            order: this.sort.direction,
            page: this.paginator.pageIndex,
            limit: this.paginator.pageSize,
            search
          });
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;
          this.selection.clear();

          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          this.selection.clear();
          return of([]);
        })
      ).subscribe(data => { this.data = data; }));
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.data.forEach(row => this.selection.select(row));
  }

  openDialog(path: string, id: number): void {
    const newPath = [];
    for (let i = 0; i <= id; i++) {
      newPath.push(path[i]);
    }
    const dialogRef = this.dialog.open(FilesDialogComponent, {
      minWidth: '250px',
      data: {
        name: path[id],
        path: newPath,
        nivel: id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  download(fileItem: FileItem) {
    this.loading = true;
    const path = '/' + fileItem.path.join('/') + '/' + fileItem.name;
    this.fileService.download(path).subscribe((data: any) => {
      this.loading = false;
      const url = environment.dataserver + '/download/' + data.key;
      console.log(url);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileItem.name;
      document.body.appendChild(a);
      a.click();
    }, () => { this.loading = false; });
  }
}
