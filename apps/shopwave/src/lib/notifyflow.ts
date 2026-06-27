// This is the private client used exclusively server-side in Shopwave.
// It communicates with the Notifyflow API via the secret API key.

const NOTIFYFLOW_API_URL = process.env.NOTIFYFLOW_API_URL || "http://localhost:5001";
const NOTIFYFLOW_API_KEY = process.env.NOTIFYFLOW_API_KEY;

export interface NotifyOptions {
  channel: 'EMAIL' | 'WEBHOOK' | 'IN_APP' | 'SMS';
  recipient: string;
  template?: string;
  rawSubject?: string;
  rawBody?: string;
  data?: Record<string, string | number | boolean>;
  priority?: 'HIGH' | 'DEFAULT' | 'BULK';
}

export async function notify(options: NotifyOptions) {
  if (!NOTIFYFLOW_API_KEY) {
    throw new Error("NOTIFYFLOW_API_KEY environment variable is not set");
  }

  const { template, ...rest } = options;
  const payload = {
    ...rest,
    ...(template ? { templateName: template } : {}),
  };

  const url = `${NOTIFYFLOW_API_URL}/api/v1/notify`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": NOTIFYFLOW_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Notifyflow API Error] POST ${url} returned status ${response.status}: ${text}`);
    throw new Error(`Notifyflow request failed: Status ${response.status}`);
  }

  return response.json();
}

export async function getInAppNotifications(recipientId: string) {
  if (!NOTIFYFLOW_API_KEY) {
    throw new Error("NOTIFYFLOW_API_KEY environment variable is not set");
  }

  const url = `${NOTIFYFLOW_API_URL}/api/v1/notify/inapp/${recipientId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": NOTIFYFLOW_API_KEY,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Notifyflow API Error] GET ${url} returned status ${response.status}: ${text}`);
    throw new Error(`Failed to fetch in-app notifications: Status ${response.status}`);
  }

  return response.json();
}

export async function markInAppNotificationsAsRead(recipientId: string) {
  if (!NOTIFYFLOW_API_KEY) {
    throw new Error("NOTIFYFLOW_API_KEY environment variable is not set");
  }

  const url = `${NOTIFYFLOW_API_URL}/api/v1/notify/inapp/${recipientId}/read`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": NOTIFYFLOW_API_KEY,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Notifyflow API Error] POST ${url} returned status ${response.status}: ${text}`);
    throw new Error(`Failed to mark notifications as read: Status ${response.status}`);
  }

  return response.json();
}

export async function getNotificationStatus(id: string) {
  if (!NOTIFYFLOW_API_KEY) {
    throw new Error("NOTIFYFLOW_API_KEY environment variable is not set");
  }

  const url = `${NOTIFYFLOW_API_URL}/api/v1/notify/${id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": NOTIFYFLOW_API_KEY,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Notifyflow API Error] GET ${url} returned status ${response.status}: ${text}`);
    throw new Error(`Failed to retrieve notification status: Status ${response.status}`);
  }

  return response.json();
}
