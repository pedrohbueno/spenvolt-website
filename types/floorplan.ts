export type RoomType = 'bedroom' | 'bathroom' | 'living' | 'kitchen' | 'laundry' | 'office';

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  deviceIds: number[];
}
