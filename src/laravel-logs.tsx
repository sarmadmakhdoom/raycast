import { Action, ActionPanel, open, List, getPreferenceValues } from "@raycast/api";
import { useCallback, useState } from "react";
import fs from "fs";
import R from "lodash";
interface LaravelProjects {
  title: string;
  path: string;
}

export default function Command() {
  const { BASE_PATH } = getPreferenceValues();
  const [search, setSearch] = useState<string>("");
  const projects: LaravelProjects[] = [
    { title: "GrandCentral", path: "grandcentral-react" },
    { title: "Rave 2.0", path: "rave2.0" },
    { title: "Rave 1.0", path: "gsr-web" },
    { title: "YESA", path: "yesa-web" },
    { title: "Vendor", path: "vendor-gsr" },
  ];

  const openLogs = useCallback((project: LaravelProjects) => {
    // Find the last updated log file
    // Iterate files in the folder
    // Get the last updated file
    const dir = `${BASE_PATH}${project.path}/storage/logs`;
    const files = fs.readdirSync(dir);
    const logFiles = files.filter((f) => f.includes(".log"));
    const sortedFiles = logFiles.map((f) => ({
      name: f,
      time: fs.statSync(`${dir}/${f}`).mtime.getTime(),
    }));
    const sorted = R.sortBy(sortedFiles, "time");
    const lastUpdated = sorted[sorted.length - 1];
    const path = `${dir}/${lastUpdated.name}`;
    // Open in default application
    open(path);
  }, []);

  return (
    <List
      filtering={true}
      searchText={search}
      onSearchTextChange={setSearch}
      navigationTitle="GrandCentr.al"
      searchBarPlaceholder="Search GrandCentral accounts..."
    >
      {projects.map((p) => (
        <List.Item
        key={p.title}
          icon="laravel.svg"
          accessories={[{ text: `${BASE_PATH}${p.path}` }]}
          title={p.title}
          actions={
            <ActionPanel>
              <Action title="Open Logs" onAction={() => openLogs(p)} />
              <Action.Open title="Open in Finder" target={`${BASE_PATH}${p.path}`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
