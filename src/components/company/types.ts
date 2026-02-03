export interface Company {
  id: number;
  name: string;
  state?: string; // Np. "active", "archived"
}

export interface CreateCompanyDto {
  name: string;
}
