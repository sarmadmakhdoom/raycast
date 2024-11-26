import { open, MenuBarExtra, getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";

interface ClickupData {
  id: string;
  title: string;
  url: string;
}

interface Response {
  synced: ClickupData[];
  sprint: Record<string, ClickupData[]>;
  totalSprintTasks: number;
}

export default function Command() {
  const HOST = "https://app.grandcentr.al";
  // const HOST = "http://app.gc.local";
  const { EMAIL, SYNCED } = getPreferenceValues();
  const { data, isLoading } = useFetch<Response>(`${HOST}/api/raycast/clickup-all?email=${EMAIL}`, {
    headers: {'Content-Type': 'application/json'} 
  });

  const synced = data?.synced || [];
  const statuses = data ? Object.keys(data.sprint) : [];

  const title = useMemo(() => {
    if (!data) return "Loading...";
    if (SYNCED) {
      if (synced.length === 0 && data.totalSprintTasks == 0) return undefined;
      if (synced.length === 0 && data.totalSprintTasks > 0) return data.totalSprintTasks.toString();
      if (synced.length == 1) return "1 task";
      return `${synced.length} tasks`;
    } else {
      if (data.totalSprintTasks == 0) return undefined;
      if (data.totalSprintTasks == 1) return "1 task";
      return `${data.totalSprintTasks} tasks`;
    }
  }, [synced, data]);

  const icon = useMemo(() => {
    if (!data || synced.length === 0) return "clickup-nodanger.png";
    if (synced.length > 0 && SYNCED) return "clickup-danger.svg";
    return "clickup-nodanger.png";
  }, [synced, SYNCED, data]);

  return (
    <MenuBarExtra icon={icon} isLoading={isLoading} title={title}>
      {SYNCED && synced.length > 0 && (
        <MenuBarExtra.Section title="Recently Synced">
          {!!data &&
            synced.map((item) => (
              <MenuBarExtra.Item
                title={item.title}
                key={item.id}
                onAction={async () => {
                  open(item.url);
                }}
              />
            ))}
        </MenuBarExtra.Section>
      )}
      {statuses.map((status) => (
        <MenuBarExtra.Section title={status} key={status}>
          {data?.sprint[status].map((item) => (
            <MenuBarExtra.Item
              title={item.title}
              key={item.id}
              onAction={async () => {
                open(item.url);
              }}
            />
          ))}
        </MenuBarExtra.Section>
      ))}
    </MenuBarExtra>
  );
}
