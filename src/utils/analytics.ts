import { projectId, publicAnonKey } from "./supabase/info";

interface TrackingData {
  userEmail?: string;
  userName?: string;
}

export const trackVisit = async (
  page: string,
  userData?: TrackingData
) => {
  try {
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-92e03882/analytics/track-visit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          page,
          userEmail: userData?.userEmail,
          userName: userData?.userName,
        }),
      }
    );
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
};

export const trackInteraction = async (
  action: string,
  data?: any,
  userData?: TrackingData
) => {
  try {
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-92e03882/analytics/track-interaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          action,
          data,
          userEmail: userData?.userEmail,
          userName: userData?.userName,
        }),
      }
    );
  } catch (error) {
    console.error("Failed to track interaction:", error);
  }
};