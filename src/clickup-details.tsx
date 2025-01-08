import { Detail, ActionPanel, Action, showToast, Toast, showHUD, LaunchProps } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { Fragment, useCallback, useMemo } from "react";
import * as R from "lodash";
import { ClickupTask } from "./clickuptask";
import fetch from "node-fetch";

interface Response {
  task: ClickupTask;
}

export default function Command(props: LaunchProps) {
  // const HOST = "https://app.grandcentr.al";
  const taskId = '86er56fzv'; //props.arguments.taskId;
  const HOST = "http://app.gc.local";
  const { data, isLoading, revalidate } = useFetch<Response>(`${HOST}/api/raycast/task/${taskId}`, {
    headers: { "Content-Type": "application/json" },
  });

  const task = useMemo(() => data?.task, [data]);

  const onAssign = useCallback(async (email: string) => {
    // Add assignee to task
    await showToast({
      style: Toast.Style.Animated,
      message: email,
      title: "Assigning task",
    })
    console.log(`${HOST}/api/raycast/assign-and-move/${taskId}?email=${email}`)
    await fetch(`${HOST}/api/raycast/assign-and-move/${taskId}?email=${email}`);
    await showToast({
      style: Toast.Style.Success,
      message: email,
      title: "Assigning task",
    })
    revalidate();

  }, [taskId, revalidate]);

  return (
    <Detail
      isLoading={isLoading}
      markdown={task?.text_content}
      navigationTitle={task?.name}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={task?.url || ""} />
          {task?.list.name === "GrandCentral" && (
            <Fragment>
              <Action title="Assign to Sarmad" onAction={() => onAssign('sarmad@studio98.com')} />
              <Action title="Assign to Abdul" onAction={() => onAssign('abdul@studio98.com')} />
              <Action title="Assign to Saad" onAction={() => onAssign('saad@studio98.com')} />
              <Action title="Assign to Hayder" onAction={() => onAssign('hayder@studio98.com')} />
              <Action title="Assign to Zubair" onAction={() => onAssign('zubair@studio98.com')} />
              <Action title="Assign to Arham" onAction={() => onAssign('arham@studio98.com')} />
              <Action title="Assign to Nabeel" onAction={() => onAssign('nabeel@studio98.com')} />
              <Action title="Assign to Hassan" onAction={() => onAssign('hassan@studio98.com')} />
            </Fragment>
          )}
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="List" text={task?.list.name || ""} />
          <Detail.Metadata.TagList title="Priority">
              <Detail.Metadata.TagList.Item  text={R.upperCase(task?.priority.priority)} color={task?.priority.color} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Status" text={R.upperCase(task?.status.status || "")} />
          <Detail.Metadata.TagList title="Assignees">
            {(task?.assignees || []).map((assignee) => (
              <Detail.Metadata.TagList.Item key={assignee.id} text={assignee.username} />
            ))}
          </Detail.Metadata.TagList>
          <Detail.Metadata.TagList title="Tags">
            {(task?.tags || []).map((tag) => (
              <Detail.Metadata.TagList.Item key={tag.name} text={tag.name} />
            ))}
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    />
  );
}
