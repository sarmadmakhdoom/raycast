import { Action, ActionPanel, Detail, List, LocalStorage, useNavigation } from "@raycast/api";
import { useFetch, useLocalStorage } from "@raycast/utils";
import { Fragment, useEffect, useMemo, useState } from "react";
import R from "lodash";

interface GCTenantData {
  items: {
    title: string;
    subtitle: string;
    arg: string;
    uid: string;
  }[];
}

interface WorkOrder {
  id: number;
  number: string;
  name: string;
  orgId: number;
  organization: string;
  estimateId: number;
  status: string;
  link: string;
  markdown: string;
}
interface User {
  id: number;
  name: string;
  email: string;
}
interface Result {
  workOrders: WorkOrder[];
  users: User[]
}

interface TenantSelectionProps {
  onSelect: (uid: string) => void;
}

function TenantSelection(props: TenantSelectionProps) {
  const { isLoading, data } = useFetch<GCTenantData>("https://app.grandcentr.al/api/alfred");

  const items = useMemo(() => {
    if (!data) return [];
    return R.sortBy(data.items, ["title"]);
  }, []);

  return (
    <List.Dropdown isLoading={isLoading} tooltip="Select Tenant" storeValue={true} onChange={props.onSelect}>
      {items.map((i) => (
        <List.Dropdown.Item key={i.uid} keywords={[i.uid.toString()]} title={i.title} value={i.uid.toString()} />
      ))}
    </List.Dropdown>
  );
}

export default function Command() {
  const [search, setSearch] = useState<string>("");
  const [tenant, setTenant] = useState<string>("");
  const { isLoading, data, revalidate } = useFetch<Result>(
    `http://app.gc.local/api/raycast/gc-search?search=${search}&tenant=${tenant}`,
    {
      headers: { "Content-Type": "application/json" },
      execute: false,
    },
  );

  const { push } = useNavigation();



  useEffect(() => {
    if (!R.isEmpty(search)) {
      revalidate();
    }
  }, [search]);

  return (
    <List
      filtering={false}
      throttle={true}
      onSearchTextChange={setSearch}
      isLoading={isLoading}
      navigationTitle="GC Serch"
      searchBarPlaceholder="Search GrandCentral"
      searchBarAccessory={<TenantSelection onSelect={setTenant} />}
      isShowingDetail
    >
      {!!data && data.users.length > 0 && (
        <List.Section title="Users">
          {data.users.map((wo) => (
            <List.Item
              key={wo.id.toString()}
              title={wo.name}
              detail={
                <List.Item.Detail
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title="ID" text={wo.id.toString()} />
                      <List.Item.Detail.Metadata.Label title="Name" text={wo.name}  />
                      <List.Item.Detail.Metadata.Label title="Email" text={wo.email}  />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
            />
          ))}
        </List.Section>
      )}
      {!!data && data.workOrders.length > 0 && (
        <List.Section title="Work Orders">
          {data.workOrders.map((wo) => (
            <List.Item
              key={wo.id.toString()}
              title={wo.number}
              detail={
                <List.Item.Detail
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title="ID" text={wo.id.toString()} />
                      <List.Item.Detail.Metadata.Link title="Link" text={"Open"} target={wo.link} />
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="OrgId" text={wo.orgId.toString()} />
                      <List.Item.Detail.Metadata.Label title="Organization" text={wo.organization} />
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Estimate Id" text={wo.estimateId.toString()} />
                      <List.Item.Detail.Metadata.Label title="Status" text={wo.status} />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel title="Open">
                  <Action title="Open" onAction={() => push(<WorkOrder item={wo} />)} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

function WorkOrder(props: { item: WorkOrder }) {
  const { item } = props;

  return <Detail navigationTitle={item.number} markdown={item.markdown} />;
}
