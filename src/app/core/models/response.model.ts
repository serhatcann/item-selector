export interface ApiResponse {
  folders: {
    columns: string[];
    data: [number, string, number | null][];
  };
  items: {
    columns: string[];
    data: [number, string, number][];
  };
}
