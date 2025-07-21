import {
  Action,
  ActionPanel,
  List,
  getPreferenceValues,
  useNavigation,
  Form,
  popToRoot,
  launchCommand,
  LaunchType,
} from "@raycast/api";

import { useFetch, useLocalStorage } from "@raycast/utils";
import { useEffect, useMemo, useState } from "react";
import R from "lodash";
import { exec } from "node:child_process";

interface RaveRetailerData {
  items: {
    title: string;
    subtitle: string;
    arg: string;
    uid: string;
  }[];
}

const execPromise = (command: string) =>
  new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });

interface PROJECT_DATA {
  name: string;
  shortCodes: string[];
  project: string;
  defaultInstance: string;
}

const PROJECT_LIST: Record<string, PROJECT_DATA> = {
  PROJECT_RAVE_V1: {
    project: "gsr-shared",
    name: "Rave v1",
    shortCodes: ["rave1", "rave"],
    defaultInstance: "gsr-shared",
  },
  PROJECT_RAVE_V2: { project: "raveretailer", name: "Rave v2", shortCodes: ["r2"], defaultInstance: "raveretailer" },
  PROJECT_EH: {
    project: "rave-energized-health",
    name: "Rave - Energized Health",
    shortCodes: ["eh"],
    defaultInstance: "eh-mysql",
  },
  PROJECT_JIFU: { project: "rave-jifu", name: "Rave - Jifu", shortCodes: ["jifu"], defaultInstance: "rave-jifu" },
  PROJECT_GC: {
    project: "grandcentral-305016",
    name: "GrandCentral",
    shortCodes: ["gc"],
    defaultInstance: "grand-central-prod",
  },
  PROJECT_AI: {
    project: "ai-studio98",
    name: "Studio98 AI",
    shortCodes: ["ai"],
    defaultInstance: "aistudio98",
  },
  PROJECT_YESA: { project: "yesa-app", name: "YESA", shortCodes: ["yesa"], defaultInstance: "yesa" },
  PROJECT_MAKH: { project: "got-management", name: "MAKH", shortCodes: ["makh"], defaultInstance: "makh-org" },
  PROJECT_SUCCEED: { project: "succeed-430915", name: "Succeed", shortCodes: ["succ"], defaultInstance: "succeed" },
};

export default function Command() {
  const { GCLOUD_PATH, DOWNLOAD_PATH, ScriptsPath, ...projectValues } = getPreferenceValues();
  const { push } = useNavigation();
  const [search, setSearch] = useState<string>("");

  const selectedProjects: PROJECT_DATA[] = useMemo(() => {
    const configKeys = R.keys(projectValues);

    return configKeys.filter((key) => projectValues[key]).map((key) => PROJECT_LIST[key]);
  }, [projectValues]);

  useEffect(() => {
    selectedProjects.forEach((project) => {
      if (project.shortCodes.map((s) => `${s} `).includes(search)) {
        setSearch("");
        push(
          <InstanceSelection
            GCLOUD_PATH={GCLOUD_PATH}
            project={project.project}
            selectedInstance={project.defaultInstance}
          />,
        );
      }
    });
  }, [search, projectValues]);

  return (
    <List
      filtering
      onSearchTextChange={setSearch}
      searchText={search}
      navigationTitle="gSQL"
      searchBarPlaceholder="Select project..."
    >
      {(selectedProjects || []).map((item) => (
        <List.Item
          key={item.project}
          icon={{ source: "google.png" }}
          title={item.name}
          subtitle={item.project}
          accessories={[{ text: item.shortCodes.join(", ") }]}
          keywords={item.shortCodes}
          actions={
            <ActionPanel>
              <Action
                title="Select Database"
                onAction={() => push(<InstanceSelection GCLOUD_PATH={GCLOUD_PATH} project={item.project} />)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function InstanceSelection(props: { GCLOUD_PATH: string; project: string; selectedInstance?: string }) {
  const { GCLOUD_PATH, project, selectedInstance } = props;
  const { push } = useNavigation();
  const [sInstance, setInstance] = useState<string | undefined>(selectedInstance);
  const {
    value: items,
    setValue: setItems,
    isLoading,
  } = useLocalStorage<{ name: string }[]>(`sql-instances-${project}`, []);

  useEffect(() => {
    if (sInstance) {
      setInstance(undefined);
      push(<DatabaseSelection GCLOUD_PATH={GCLOUD_PATH} project={project} instance={sInstance} />);
    }
  }, []);

  useEffect(() => {
    execPromise(
      `${GCLOUD_PATH}gcloud sql instances list  --filter="instanceType=CLOUD_SQL_INSTANCE" --project="${project}" --format="json(name)"`,
    ).then((res) => {
      const sqlInstances = JSON.parse(res);
      setItems(sqlInstances);
    });
  }, [project]);

  return (
    <List isLoading={isLoading} navigationTitle={project} searchBarPlaceholder="Select project...">
      {(items || []).map((item) => (
        <List.Item
          key={item.name}
          icon={{ source: "database.svg" }}
          title={item.name}
          actions={
            <ActionPanel>
              <Action
                title="Select Database"
                onAction={() =>
                  push(<DatabaseSelection GCLOUD_PATH={GCLOUD_PATH} project={project} instance={item.name} />)
                }
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function DatabaseSelection(props: { GCLOUD_PATH: string; project: string; instance: string }) {
  const { GCLOUD_PATH, instance, project } = props;
  const { push } = useNavigation();
  const [search, setSearch] = useState<string>("");
  const { data: gcData } = useFetch<RaveRetailerData>("https://app.grandcentr.al/api/alfred", {
    keepPreviousData: true,
  });
  const { data: raveData } = useFetch<RaveRetailerData>("https://admin.raveretailer.com/alfred", {
    keepPreviousData: true,
  });

  const {
    value: items,
    setValue: setItems,
    isLoading,
  } = useLocalStorage<{ name: string; title?: string }[]>(`sql-instances-${project}-${instance}`, []);

  useEffect(() => {
    execPromise(
      `${GCLOUD_PATH}gcloud sql databases list --instance="${instance}" --project="${project}" --format="json(name)"`,
    ).then((res) => {
      const sqlInstances = JSON.parse(res);
      setItems(sqlInstances);
    });
  }, [project]);
  const relevantData = useMemo(() => (instance == "gsr-shared" ? raveData : gcData), [instance, raveData, gcData]);

  const adjustedItems = useMemo(() => {
    if (!items) return [];
    if (!relevantData) return items;
    return items.map((item) => {
      const title = relevantData.items.find((gcItem) => item.name.includes(gcItem.uid))?.title;
      return { ...item, title };
    });
  }, [relevantData, items]);

  return (
    <List
      filtering={true}
      searchText={search}
      onSearchTextChange={setSearch}
      isLoading={isLoading}
      navigationTitle={`${project} -> ${instance}`}
      searchBarPlaceholder="Select project..."
    >
      {adjustedItems.map((item) => (
        <List.Item
          key={item.name}
          icon={{ source: "database.svg" }}
          title={item.name}
          subtitle={item.title}
          keywords={item.title ? [item.title] : []}
          actions={
            <ActionPanel>
              <Action
                title="Import"
                onAction={() =>
                  push(
                    <ImportDatabaseForm
                      GCLOUD_PATH={GCLOUD_PATH}
                      instance={instance}
                      project={project}
                      database={item.name}
                    />,
                  )
                }
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function ImportDatabaseForm(props: { GCLOUD_PATH: string; project: string; instance: string; database: string }) {
  const { instance, project, database } = props;
  const { DOWNLOAD_PATH, ScriptsPath } = getPreferenceValues();
  const [dbName, setDbName] = useState<string>(database);
  const [localUrl, setLocalUrl] = useState<string>("");
  const [isImport, setImport] = useState<boolean>(true);
  const domain = useMemo(() => {
    if (R.isEmpty(localUrl)) {
      return "none";
    }
    return localUrl;
  }, [localUrl]);

  // useEffect(() => {
  //   if(instance == 'gsr-vendor' && database == 'studio98') {
  //     console.log(instance, database);
  //     setDbName('gsr-vendor');
  //   }else{
  //     setDbName(database);
  //   }
  // }, [instance, database, setDbName])
  // console.log(dbName);

  return (
    <Form
      navigationTitle="Downloading Database"
      actions={
        <ActionPanel>
          <Action
            title="Download"
            onAction={async () => {
              popToRoot();
              launchCommand({
                name: "gsql-downloader",
                type: LaunchType.UserInitiated,
                arguments: {
                  project,
                  instance,
                  database,
                  dbName,
                  domain,
                  isImport: isImport == true ? "true" : "false",
                  DOWNLOAD_PATH,
                  ScriptsPath,
                },
              });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description title="Project Name" text={project} />
      <Form.Description title="Database Instance" text={instance} />
      <Form.Description title="Database Database" text={database} />
      <Form.Description title="Download Path" text={DOWNLOAD_PATH} />
      <Form.Separator />
      <Form.TextField id="dbUrl" title="Local URL" onChange={setLocalUrl} />
      <Form.TextField id="dbName" title="Database Name" onChange={setDbName} value={dbName} />
      <Form.Checkbox id="bImport" label="Import Database" defaultValue={true} onChange={setImport} />
    </Form>
  );
}
