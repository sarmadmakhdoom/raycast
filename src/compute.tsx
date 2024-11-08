import { Action, ActionPanel, List, closeMainWindow, Icon, showToast, Toast, getFrontmostApplication, launchCommand, LaunchType } from "@raycast/api";
import { useFetch, usePromise } from "@raycast/utils";
import { useCallback, useMemo, useRef } from "react";
import R from "lodash";
import { runAppleScript } from "run-applescript";

interface RaveRetailerData {
  items: {
    title: string;
    subtitle: string;
    arg: string;
    uid: string;
  }[];
}
export default function Command() {
  const { isLoading, data, revalidate } = useFetch<RaveRetailerData>("http://gcp-helpers.local/alfred");
  const abortable = useRef<AbortController>();

  const items = useMemo(() => {
    if (!data) return [];
    return R.sortBy(data.items, ["title"]);
  }, [data]);

  const groupByItems = useMemo(() => {
    return R.groupBy(items, "subtitle");
  }, [items]);

  const onAction = useCallback(async (command: string) => {
    const defaultApplication = await getFrontmostApplication();
    console.log(defaultApplication.name)
    if(defaultApplication.name === 'iTerm2'){
      await runAppleScript(`
      tell application "iTerm2"
        tell current window
        create tab with default profile command "${command}"
        activate
        end tell
      end tell
      `);
    }else{
      await runAppleScript(`
      tell application "iTerm2"
        create window with default profile command "${command}"
        activate
      end tell
      `);
    }
    await closeMainWindow({ clearRootSearch: true });
  }, []);

  const onSync = useCallback(async () => {
   await launchCommand({name: 'compute-sync', type: LaunchType.Background});
   await showToast(Toast.Style.Animated, "Syncing...", "Syncing your GCP data. This may take a few minutes.");
    // await closeMainWindow({ clearRootSearch: true });
  }, []);

  return (
    <List isLoading={isLoading} navigationTitle="Google Compute" searchBarPlaceholder="SSH into servers...">
      {R.keys(groupByItems).map((key) => (
        <List.Section key={key} title={key}>
          {groupByItems[key].map((item) => (
            <List.Item
              key={item.uid}
              title={item.title}
              subtitle={item.subtitle}
              icon={{ source: "google.png" }}
              actions={
                <ActionPanel>
                  <Action title="SSH into server" onAction={() => onAction(item.arg)} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
      <List.Section title="Sync">
        <List.Item
          title="Sync all servers"
          icon={Icon.Repeat}
          actions={
            <ActionPanel>
              <Action title="Sync servers" onAction={onSync}  />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
