import { open, MenuBarExtra } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";

interface ClickupData {
  id: string;
  title: string;
  url: string;
}

export default function Command() {
  const HOST = "https://app.grandcentr.al";
  const { data, isLoading } = useFetch<ClickupData[]>(`${HOST}/api/raycast/clickup`);

  const title = useMemo(() => {
    if (!data) return "Loading...";
    if (data.length === 0) return undefined;
    if (data.length == 1) return "1 task";
    return `${data.length} tasks`;
  }, [data]);

  const icon = useMemo(() => {
    if(!data || data.length === 0) return 'clickup-nodanger.png';
    if(data.length > 0) return 'clickup-danger.svg';
  }, [data]);

  return (
    <MenuBarExtra icon={icon} isLoading={isLoading} title={title}>
      {!!data &&
        data.map((item) => (
          <MenuBarExtra.Item
            title={item.title}
            key={item.id}
            onAction={async () => {
              open(item.url);
            }}
          />
        ))}
    </MenuBarExtra>
  );
}
