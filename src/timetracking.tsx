import { getPreferenceValues, MenuBarExtra, showHUD, showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import fetch from 'node-fetch';

interface TimeTrackingData {
  week: string;
  day: string;
  active: boolean;
  emojiActive: string;
}

export default function Command() {
  const { EMAIL } = getPreferenceValues();
  // const HOST = "http://app.gc.local";
  const HOST = "https://app.grandcentr.al";
  const {data, isLoading, revalidate} = useFetch<TimeTrackingData>(`${HOST}/api/sarmad/timesheet?email=${EMAIL}`);

  return (
    <MenuBarExtra isLoading={isLoading} title={data ? `${data.emojiActive} ${data.day} W: ${data.week}` : 'Loading...'}>
      
      <MenuBarExtra.Item
        title="Start Time"
        icon="start.svg"
        onAction={async () => {
          await showToast({
            style: Toast.Style.Animated,
            message: "Refreshed",
            title: "Starting GC time tracking",
          })
          await fetch(`${HOST}/api/sarmad/start?email=${EMAIL}`);
          await showHUD("Time tracking started");
          revalidate();
        }}
      />
      <MenuBarExtra.Item
        title="Stop Time"
        icon="stop.svg"
        
        onAction={async () => {
          await showToast({
            style: Toast.Style.Animated,
            message: "Refreshed",
            title: "Stopping GC time tracking",
          })
          await fetch(`${HOST}/api/sarmad/stop?email=${EMAIL}`);
          await showHUD("Time tracking stopped");
          revalidate();
        }}
      />
    </MenuBarExtra>
  );
}