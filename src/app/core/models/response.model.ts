export interface ApiResponse {
  folders: {
    columns: string[];
    data: (number | string | null)[][];
  };
  items: {
    columns: string[];
    data: (number | string | null)[][];
  };
}
