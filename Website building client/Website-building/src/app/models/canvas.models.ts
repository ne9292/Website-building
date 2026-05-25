export const CANVAS_WIDTH = 1100;

export interface CanvasElement {// כל אלמנט על הקנבס — תמונה, טקסט, כפתור וכו'
  id: number;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
  border: { width: number; color: string; style: string; radius: number; };
  content: any;
  shapeType?: string;
}

export interface Section {// כל קטע בדף — יכול להכיל מספר אלמנטים
  type: string;
  contentJson: string;
  stylesJson?: string;
  orderIndex?: number;
}

export interface Page {// דף באתר — יכול להכיל מספר קטעים
  id: number;
  siteId: number;
  title: string;
  slug: string;
  isHome: boolean;
  sections: Section[];
}

export interface Site {// האתר עצמו — יכול להכיל מספר דפים
  id: number;
  siteName: string;
  subdomain: string;
  primaryColor?: string;
  userId?: string;
  isPublished?: boolean;
  pages?: Page[];
}

export interface CreateSiteDto {// DTO ליצירת אתר חדש
  siteName: string;
  subdomain: string;
  primaryColor?: string;
  fontFamily?: string;
}

export interface UpdateSiteDto {// DTO לעדכון פרטי אתר קיים
  siteName?: string;
  primaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
}

export interface CreatePageDto {
  title: string;
  slug: string;
  isHome?: boolean;
}

export interface UpdatePageDto {
  title?: string;
  slug?: string;
  isHome?: boolean;
  sections?: Section[];
}
