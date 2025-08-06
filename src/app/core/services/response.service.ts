import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Folder } from '../../shared/models/folder.model';
import { Item } from '../../shared/models/item.model';
import { ApiResponse } from '../models/response.model';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResponseService {
  private readonly apiUrl = 'response.json';

  constructor(private http: HttpClient) {}

  loadData(): Observable<{ folders: Folder[]; items: Item[] }> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map((response) => this.transformResponse(response)),
      catchError((error) => {
        console.error('Failed to load data:', error);
        return throwError(() => new Error('Failed to load data'));
      })
    );
  }

  private transformResponse(response: ApiResponse): {
    folders: Folder[];
    items: Item[];
  } {
    const folders: Folder[] = response.folders.data
      .map(
        (row): Folder => ({
          id: row[0],
          title: row[1],
          parent_id: row[2],
          expanded: true,
          selectedState: 'none',
        })
      )
      .sort((a, b) => a.title.localeCompare(b.title));

    const items: Item[] = response.items.data
      .map((row) => ({
        id: row[0],
        title: row[1],
        folder_id: row[2],
        selected: false,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

    return { folders, items };
  }
}
