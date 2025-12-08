export type BestofPeriod = "week" | "month";

export type BestofItem = {
  content_type: string;
  content_id: string;
  avg_rating: number;
  rating_count: number;
  title?: string | null;
  subtitle?: string | null;
  image_url?: string | null;
};

export type BestofResponse =
  | {
      status: "ok";
      period: BestofPeriod;
      items: BestofItem[];
    }
  | {
      status: "empty";
      period: BestofPeriod;
      items: [];
    }
  | {
      status: "error";
      error: string;
    };