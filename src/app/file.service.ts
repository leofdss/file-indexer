import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileItem } from './model/file';
import { Observable } from 'rxjs';

interface Result {
  total_count: number;
  items: FileItem[];
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private http: HttpClient,
  ) { }

  listFilesTable(
    options: {
      query: object,
      sort: string,
      order: string,
      page: number,
      limit: number,
      search?: string
    }): Observable<Result> {
    const href = environment.dataserver + '/database';

    let requestUrl = `${href}?sort=${options.sort}&order=${options.order}&page=${options.page}&limit=${options.limit}`;

    if (options.search) {
      requestUrl += `&search=${options.search}`;
    }

    return this.http.get<Result>(requestUrl, {
      headers: new HttpHeaders({
        Authorization: '123',
        query: JSON.stringify(options.query)
      })
    });
  }

  listFiles(query: object): Observable<Result> {
    console.log(query);
    const href = environment.dataserver + '/database';

    return this.http.get<Result>(href, {
      headers: new HttpHeaders({
        Authorization: '123',
        query: JSON.stringify(query)
      })
    });
  }

  download(path: string): Observable<object> {
    return this.http.post(environment.dataserver + '/download', { path }, {
      headers: new HttpHeaders({
        Authorization: '123',
        'Content-Type': 'application/json',
        responseType: 'blob'
      })
    });
  }
}
