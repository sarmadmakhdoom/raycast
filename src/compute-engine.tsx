import {
  Action,
  ActionPanel,
  List,
  closeMainWindow,
  Icon,
  showToast,
  Toast,
  getPreferenceValues,
} from "@raycast/api";

import { useLocalStorage } from "@raycast/utils";
import { useCallback, useMemo } from "react";
import R from "lodash";
import { exec } from "node:child_process";
import { openInTerminal } from "./helpers";
const execPromise = (command: string) =>
  new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });

interface ComputeInstance {
  title: string;
  zone: string;
  project: string;
  group?: string;
}

const PROJECT_LIST = {
   PROJECT_RAVE_V1: "gsr-shared" ,
   PROJECT_RAVE_V2: "raveretailer" ,
   PROJECT_EH: "rave-energized-health" ,
   PROJECT_JIFU: "rave-jifu" ,
   PROJECT_GC: "grandcentral-305016" ,
   PROJECT_YESA: "yesa-app" ,
   PROJECT_MAKH: "got-management" ,
   PROJECT_SUCCEED: "succeed-430915" ,
};

export default function Command() {
  const {
    GCLOUD_PATH,
    ...projectValues
  } = getPreferenceValues();

  const selectedProjects = useMemo(() => {
    const configKeys = R.keys(projectValues);

    return configKeys.filter((key) => projectValues[key]).map((key) => (PROJECT_LIST as any)[key]);
  }, [projectValues])
  

  const { value: items, setValue: setItems, isLoading } = useLocalStorage<ComputeInstance[]>("compute-instances", []);

  const onAction = useCallback(
    async (item: ComputeInstance) => {
      const commands: string[] = [];
      if(item.group){
        (items ||[]).filter(c => c.group == item.group).forEach(c => {
          commands.push(`${GCLOUD_PATH}gcloud compute ssh ${c.title} --zone=${c.zone} --project=${c.project}`);
        } );
        await openInTerminal(commands)
        await closeMainWindow({ clearRootSearch: true });
        
      }else{
        const command = `${GCLOUD_PATH}gcloud compute ssh ${item.title} --zone=${item.zone} --project=${item.project}`;
        await openInTerminal(command);
        await closeMainWindow({ clearRootSearch: true });
      }
    },
    [GCLOUD_PATH, items],
  );

  const listOfInstances = useCallback(
    async (project: string) => {
      return execPromise(
        `${GCLOUD_PATH}gcloud compute instances list --format="json(name,zone,metadata)" --project="${project}"`,
      );
    },
    [GCLOUD_PATH],
  );

  function takeRightUntilChar(str: string, char = "/") {
    const index = R.lastIndexOf(str, char);
    return str.substring(index + 1);
  }

  const onRefresh = useCallback(async () => {
    
    let allInstances: ComputeInstance[] = [];
    for (const project of selectedProjects) {
      await showToast(Toast.Style.Animated, `Syncing ...`, project);
      const output = JSON.parse(await listOfInstances(project)).map((o) => ({
        title: o.name,
        zone: takeRightUntilChar(o.zone, "/"),
        project,
        group: R.find(o.metadata.items, m => m.key == 'instance-template')?.value,
      }));
      allInstances = [...allInstances, ...output];
    }
    setItems(allInstances);
    await showToast(Toast.Style.Success, "Synced", "Your GCP data has been synced successfully.");
  }, [selectedProjects, listOfInstances, setItems]);

  return (
    <List isLoading={isLoading} navigationTitle="Google Compute" searchBarPlaceholder="SSH into servers...">
      {(items || []).map((item) => (
        <List.Item
          key={item.title}
          icon={{ source: "google.png" }}
          title={item.title}
          subtitle={item.project}
          actions={
            <ActionPanel>
              <Action title="Ssh into Server" onAction={() => onAction(item)} />
            </ActionPanel>
          }
        />
      ))}

      <List.Section title="Sync">
        <List.Item
          title="Sync all servers"
          icon={Icon.Repeat}
          actions={
            <ActionPanel>
              <Action title="Sync Servers" onAction={onRefresh} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
