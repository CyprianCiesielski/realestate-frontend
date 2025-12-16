export interface Tag {
  id: number;
  name: string;
  state: string;
  color: string;
}

export interface CreateTagDto {
  name: string;
  color: string;
}
