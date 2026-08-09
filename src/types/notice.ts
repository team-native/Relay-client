export interface Notice {
  id: string;
  title: string;
  date: string;
  isNew?: boolean;
}

export interface NoticeDetail extends Notice {
  author: string;
  content: string;
}