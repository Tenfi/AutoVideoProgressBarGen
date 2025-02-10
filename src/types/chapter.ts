export interface Chapter {
  id: string;
  title: string;
  endTime: number; // 只需要设置结束时间
}

export interface ChapterInfo {
  title: string;
  startTime: number;
  endTime: number;
} 