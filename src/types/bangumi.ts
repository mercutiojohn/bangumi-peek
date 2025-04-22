export enum SiteType {
  INFO = 'info',
  ONAIR = 'onair',
  RESOURCE = 'resource',
}

export interface SiteItem {
  title: string;
  urlTemplate: string;
  type: SiteType;
  regions?: string[];
}

export interface SiteMeta {
  [key: string]: SiteItem;
}

export enum BangumiType {
  TV = 'tv',
  WEB = 'web',
  MOVIE = 'movie',
  OVA = 'ova',
}

export interface BangumiSite {
  site: string;
  id: string;
  url?: string;
  begin?: string;
  broadcast?: string;
  comment?: string;
}

export interface TitleTranslate {
  [key: string]: string[];
}

export interface Item {
  id?: string;
  title: string;
  titleTranslate?: TitleTranslate;
  pinyinTitles?: string[];
  type: BangumiType;
  lang: string;
  officialSite: string;
  begin: string;
  broadcast?: string;
  end: string;
  comment?: string;
  sites: BangumiSite[];
  // Additional fields for UI presentation
  coverImage?: string;
  rating?: number;
  favorite?: boolean;
}

export interface ItemList {
  items: Item[];
}

export interface Data {
  siteMeta: SiteMeta;
  items: Item[];
  version?: number;
}

export interface SeasonList {
  version: number;
  items: string[];
}

// New types for the bangumi-peek project

export enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum LayoutType {
  GRID = 'grid',
  TIMELINE = 'timeline',
  POSTER_WALL = 'poster-wall',
}

export interface LayoutConfig {
  type: LayoutType;
  animation: boolean;
  showDetails: boolean;
}

export interface BangumiFilter {
  search: string;
  weekday?: WeekDay | null;
  type?: BangumiType | null;
  season?: string | null;
}

