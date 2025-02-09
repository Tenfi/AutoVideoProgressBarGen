import { ProgressBarStyle, VideoMetadata } from '../types'

export const DEFAULT_VIDEO_METADATA: VideoMetadata = {
  width: 1920,
  height: 1080,
  fps: 30,
  format: 'mp4'
}

export const DEFAULT_PROGRESS_BAR_STYLE: ProgressBarStyle = {
  height: 40,
  topMargin: 20,
  backgroundColor: '#333333',
  activeColor: '#4A90E2',
  textColor: '#FFFFFF',
  fontFamily: 'Microsoft YaHei',
  fontSize: 24,
  backgroundOpacity: 0.8
}

export const MAX_CHAPTER_COUNT = 10
export const MAX_CHAPTER_TITLE_LENGTH = 20
export const MIN_DURATION = 0.1
export const MAX_DURATION = 999.9 