export interface AdminProject {
  id: string;
  title: string;
  description: string;
  image: string | null;
  tags: string[];
  link: string | null;
  github: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormValues {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  github: string;
}
