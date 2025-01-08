import { open, MenuBarExtra, getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import * as R from "lodash";

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
    headers: { "Content-Type": "application/json" },
  });

  const statusOrders = [
    "Now",
    "Need Info",
    "In Development",
    "Dev Testing",
    "To Do",
    "Hold",
    "In Progress",
    "Staging",
    "Need Documentation",
  ];

  const synced = data?.synced || [];

  const title = useMemo(() => {
    if (!data) return "Loading...";
    if (SYNCED) {
      if (synced.length === 0 && data.totalSprintTasks == 0) return undefined;
      if (synced.length === 0 && data.totalSprintTasks > 0) return data.totalSprintTasks.toString();
      if (synced.length == 1) return "1 task";
      return `${synced.length} tasks`;
    } else {
      if (data.totalSprintTasks == 0) return undefined;
      if (data.totalSprintTasks == 1) return "1";
      return `${data.totalSprintTasks}`;
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
              <MenuBarExtra.Item title={item.title} key={item.id} onAction={async () => open(item.url)} />
            ))}
        </MenuBarExtra.Section>
      )}
      {statusOrders.map((status) => {
        const items = R.get(data, `sprint.${status}`, []);
        if (items.length === 0) return null;

        return (
          <MenuBarExtra.Section title={status} key={status}>
            {data?.sprint[status].map((item) => (
              <MenuBarExtra.Item title={item.title} key={item.id} onAction={async () => open(item.url)} />
            ))}
          </MenuBarExtra.Section>
        );
      })}
      <MenuBarExtra.Section title="Team">
        <TeamMemberMenu email="abdul@studio98.com" title="Abdul" />
        <TeamMemberMenu email="saad@studio98.com" title="Saad" />
        <TeamMemberMenu email="hayder@studio98.com" title="Hayder" />
        <TeamMemberMenu email="zubair@studio98.com" title="Zubair" />
        <TeamMemberMenu email="arham@studio98.com" title="Arham" />
        <TeamMemberMenu email="nabeel@studio98.com" title="Nabeel" />
        <TeamMemberMenu email="shayan@studio98.com" title="Shayan" />
        <TeamMemberMenu email="hassan@studio98.com" title="Hassan" />
        <TeamMemberMenu email="hanan@studio98.com" title="Hanan" />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}

const TeamMemberMenu = ({ email, title }: { email: string; title: string }) => {
  const HOST = "https://app.grandcentr.al";
  const { data } = useFetch<Response>(`${HOST}/api/raycast/clickup-all?email=${email}`, {
    headers: { "Content-Type": "application/json" },
  });

  const statusOrders = [
    "Now",
    "Need Info",
    "In Development",
    "Dev Testing",
    "To Do",
    "Hold",
    "In Progress",
    "Staging",
    "Need Documentation",
  ];

  return (
    <MenuBarExtra.Submenu title={data ? `${title} (${data.totalSprintTasks.toString()})` : title}>
      {statusOrders.map((status) => {
        const items = R.get(data, `sprint.${status}`, []);
        if (items.length === 0) return null;

        return (
          <MenuBarExtra.Section title={status} key={status}>
            {data?.sprint[status].map((item) => (
              <MenuBarExtra.Item title={item.title} key={item.id} onAction={async () => open(item.url)} />
            ))}
          </MenuBarExtra.Section>
        );
      })}
    </MenuBarExtra.Submenu>
  );
};
