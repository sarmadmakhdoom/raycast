import { Action, ActionPanel, List, Icon, useNavigation } from "@raycast/api";

import { useFetch, usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";
import moment from "moment";

interface JobResponse {
  id: string;
  name: string;
  queue: string;
  completedAt: number;
  failedAt: number;
  exception: string;
  tenantId: string;
}

interface LaravelProject {
  name: string;
  url: string;
  jobUrl: string;
  tags?: string[];
}
const PROJECT_LIST: LaravelProject[] = [
  {
    name: "GrandCentral",
    url: "https://app.grandcentr.al",
    jobUrl: "https://app.grandcentr.al/studio98-horizon",
    tags: ["gc"],
  },
  { name: "Rave 1.0", url: "https://app.raveretailer.com/", jobUrl: "https://app.raveretailer.com/studio98-horizon" },
  { name: "Rave 2.0", url: "https://api2.raveretailer.com/", jobUrl: "https://queue.raveretailer.com/" },
  { name: "Studio98 AI", url: "https://api.studio98.ai/", jobUrl: "https:/queue.studio98.ai", tags: ["ai", "s98"] },
  { name: "YESA", url: "https://app.yesa.ca/", jobUrl: "https://app.yesa.ca/studio98-horizon", tags: ["yesa"] },
  { name: "Succeed", url: "https://app.succeedhq.com/", jobUrl: "https://app.succeedhq.com/studio98-horizon" },
];

export default function Command() {
  const { push } = useNavigation();

  return (
    <List
      navigationTitle="Projects"
      searchBarPlaceholder="Select Project"
    >
      {PROJECT_LIST.map((item) => (
        <List.Item
          key={item.name}
          title={item.name}
          subtitle={item.url}
          keywords={item.tags}
          actions={
            <ActionPanel>
              <Action
                title="Open"
                onAction={() => {
                  push(<JobsList project={item} />);
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
interface JobTypeSelectionProps {
  onSelect: (uid: string) => void;
}

function JobTypeSelection(props: JobTypeSelectionProps) {
  return (
    <List.Dropdown tooltip="Select Job Type" storeValue={true} onChange={props.onSelect} >
      <List.Dropdown.Item keywords={["completed"]} title={"Completed"} value={"completed"} />
      <List.Dropdown.Item keywords={["failed"]} title={"Failed"} value={"failed"} />
      <List.Dropdown.Item keywords={["pending"]} title={"Pending"} value={"pending"} />
      <List.Dropdown.Item keywords={["silenced"]} title={"Silenced"} value={"silenced"} />
    </List.Dropdown>
  );
}

function JobsList(props: { project: LaravelProject }) {
  const { project } = props;
  const [searchText, setSearchText] = useState("");
  const [type, setType] = useState<string>("");
  // const { data, isLoading } = useFetch<JobResponse[]>(
  //   `${project.url}/api/horizon-on-steriods/${type}?search=${searchText}`,
  //   {
  //     headers: { "Content-Type": "application/json" },
  //     cache: "no-cache",
  //     keepPreviousData: false,
  //   },
  // );

   const { isLoading, data, pagination } = usePromise(
    (searchText: string, type: string) => async (options: { page: number }) => {
      const response = await fetch(`${project.url}/api/horizon-on-steriods/${type}?search=${searchText}&page=${options.page}`, {
        headers: { "Content-Type": "application/json" },
        cache: "no-cache",
      });
      const data = await response.json() as JobResponse[];

      
      return { data, hasMore: data.length == 50};
    },
    [searchText, type]
  );

  console.log(pagination)

  

  return (
    <List
      isLoading={isLoading}
      navigationTitle={project.name}
      searchBarPlaceholder="Select project..."
      isShowingDetail
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarAccessory={<JobTypeSelection onSelect={setType} />}
      pagination={pagination}
    >
      {(data || []).map((item) => {
        let url =
          type == "failed" ? `${project.jobUrl}/${type}/${item.id}` : `${project.jobUrl}/jobs/${type}/${item.id}`;
        if (project.name == "Rave 1.0") {
          url =
            type == "failed" ? `${project.jobUrl}/${type}/${item.id}` : `${project.jobUrl}/recent-jobs/${item.id}`;
        }

        return (
          <List.Item
            key={item.id}
            icon={{ source: "queue.svg" }}
            title={item.name.split("\\").pop() || item.name}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="Open in Browser" url={url} icon={Icon.Globe} />
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="ID" text={item.id} />
                    <List.Item.Detail.Metadata.Label title="Name" text={item.name} />
                    <List.Item.Detail.Metadata.Label title="Queue" text={item.queue} />
                    {!!item.tenantId && <List.Item.Detail.Metadata.Label title="Tenant Id" text={item.tenantId} />}
                    {!!item.completedAt && (
                      <List.Item.Detail.Metadata.Label
                        title="Completed At"
                        text={moment(item.completedAt * 1000).format("MMMM Do YYYY, h:mm:ss a")}
                      />
                    )}
                    {!!item.failedAt && (
                      <List.Item.Detail.Metadata.Label
                        title="Failed At"
                        text={moment(item.failedAt * 1000).format("MMMM Do YYYY, h:mm:ss a")}
                      />
                    )}
                  </List.Item.Detail.Metadata>
                }
              />
            }
          />
        );
      })}
    </List>
  );
}
