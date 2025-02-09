export interface Chapter {
  id: string;
  title: string;
  startTime: number; // 以分钟为单位
  endTime: number; // 以分钟为单位
}

export interface VideoConfig {
  totalDuration: number; // 以分钟为单位
  chapters: Chapter[];
}

export interface ProgressBarStyle {
  height: number;
  topMargin: number;
  backgroundColor: string;
  activeColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  backgroundOpacity: number;
}

export interface VideoMetadata {
  width: number;
  height: number;
  fps: number;
  format: string;
} 