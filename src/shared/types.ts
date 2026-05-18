export type ExtensionSettings = {
  globalEnabled: boolean;
  showPanel: boolean;
  panelPreview: boolean;
  autoDetect: boolean;
  autoPause: boolean;
  bypassSiteAutoPause: boolean;
  panelOpacity: number;
  enablePictureInPicture: boolean;
  enableExternalSubtitle: boolean;
  enableJump: boolean;
  jumpSmallSeconds: number;
  jumpLargeSeconds: number;
  subFontSize: number;
  subFontColor: string;
  subBgColor: string;
  subBgOpacity: number;
  subTextShadow: boolean;
  subBottom: number;
  antiRedirect: boolean;
  blockOutsideIframes: boolean;
  enableShortcuts: boolean;
  adDomains: string[];
  lyricsOffset: number;
};

export type RuntimeMessage =
  | { type: 'VE_GET_STATE'; hostname: string }
  | { type: 'VE_SET_STATE'; hostname: string; enabled: boolean }
  | { type: 'VE_STATE_CHANGED'; enabled: boolean }
  | { type: 'VE_SETTINGS_UPDATED'; settings: ExtensionSettings }
  | { type: 'VE_FETCH_OG'; url: string };

export type LinkMetadata = {
  url: string;
  hostname: string;
  title: string;
  description: string;
  image: string;
  imageDataUrl: string;
  siteName: string;
};
