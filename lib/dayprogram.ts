export type DayprogramSlotType =
  | "tour"
  | "game"
  | "focus"
  | "salon"
  | "academie"
  | "best-of";

export type DayprogramSlot = {
  id: string | number;
  date: string;
  slot_key: DayprogramSlotType | string;
  content_type: string;
  content_id: string | number;
  is_premium: boolean;
  is_free: boolean;
};

export type DayprogramTodayResponse =
  | {
      status: "ok";
      date: string;
      slots: DayprogramSlot[];
      meta: {
        total_slots: number;
        premium_slots: number;
        free_slots: number;
      };
    }
  | {
      status: "empty";
      date: string;
      slots: [];
      meta: {
        total_slots: 0;
        premium_slots: 0;
        free_slots: 0;
      };
    }
  | {
      status: "error";
      error: string;
    };