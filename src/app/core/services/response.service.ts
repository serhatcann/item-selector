import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Folder } from '../../shared/models/folder.model';
import { Item } from '../../shared/models/item.model';
import { ApiResponse } from '../models/response.model';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResponseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'response.json';

  loadData(): Observable<(Folder | Item)[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map((response) => {
        const { folders, items } = this.transformResponse(response);
        return this.buildTree(folders, items);
      }),
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
    const folders = response.folders.data
      .map(
        (row): Folder => ({
          id: row[0],
          title: row[1],
          parent_id: row[2],
          expanded: true,
          selectedState: 'none',
          children: [],
        })
      )
      .sort((a, b) => a.title.localeCompare(b.title));

    const items = response.items.data
      .map(
        (row): Item => ({
          id: row[0],
          title: row[1],
          folder_id: row[2],
          selected: false,
        })
      )
      .sort((a, b) => a.title.localeCompare(b.title));

    return { folders, items };
  }

  private buildTree(folders: Folder[], items: Item[]): (Folder | Item)[] {
    const folderMap = new Map<number, Folder>();
    const rootFolders: Folder[] = [];
    const childFolders: Folder[] = [];

    // Build folder map, identify root folders and child folders
    folders.forEach((folder) => {
      folderMap.set(folder.id, folder);
      if (!folder.parent_id) {
        rootFolders.push(folder);
      } else {
        childFolders.push(folder);
      }
    });

    // Add items to their folders
    const orphanItems: Item[] = [];
    items.forEach((item) => {
      const parentFolder = folderMap.get(item.folder_id);
      if (parentFolder) {
        parentFolder.children?.push(item);
      } else {
        orphanItems.push(item);
      }
    });

    // Add child folders to their parent folders
    childFolders.forEach((folder) => {
      const parentFolder = folderMap.get(folder.parent_id!);
      if (parentFolder) {
        parentFolder.children?.push(folder);
      }
    });

    return [...rootFolders, ...orphanItems];
  }
}
