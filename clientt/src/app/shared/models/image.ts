export interface IImage {
    from: string | null;
    to?:string;
    content: string;
    time: Date;
    seen?:boolean;
  }