export interface Notice {
  id: string;
  title: string;
  createdAt?: string;
  date: string;
  isNew?: boolean;
}

export interface NoticeDetail extends Notice {
  author: string;
  content: string;
}