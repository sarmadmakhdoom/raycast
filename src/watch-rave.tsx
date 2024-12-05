import { MenuBarExtra, showToast, Toast } from "@raycast/api";
import { runAppleScript, useExec } from "@raycast/utils";
import { useCallback, useMemo } from "react";

import { exec } from "node:child_process";

const execPromise = (command: string) =>
  new Promise<string>((resolve, reject) => {
    exec(
      command,
      {
        env: {
          HOME: process.env.HOME,
          PATH: "/Users/sarmadmakhdoom/scripts:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/go/bin",
        },
      },
      (error, stdout) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      },
    );
  });

export default function Command() {
  const SESSION = "rave";
  const PATH = "/Users/sarmadmakhdoom/www/rave-app";
  const { data, isLoading, revalidate } = useExec<string>(`/Users/sarmadmakhdoom/scripts/checksession.sh`, [SESSION], {
    keepPreviousData: false,
  });

  const isRunning = useMemo(() => data == "Yes", [data]);

  const onStop = useCallback(async () => {
    await execPromise(`tmux kill-session -t ${SESSION}`);
    revalidate();
    await showToast({
      style: Toast.Style.Failure,
      message: "Refreshed",
      title: `Watch Stopped`,
    });
  }, [revalidate]);

  const onStart = useCallback(async () => {
    await execPromise(`watch.sh ${SESSION} ${PATH}`);
    revalidate();
    await showToast({
      style: Toast.Style.Success,
      message: "Refreshed",
      title: `Started Watch`,
    });
  }, [revalidate]);

  const openTerminal = useCallback(() => {
    runAppleScript(`tell application "iTerm2"
    create window with default profile
      tell current session of current window
          write text "tmux attach -t ${SESSION}"
      end tell
  end tell
      
      `);
  }, [SESSION]);

  return (
    <MenuBarExtra icon={isRunning ? "watch-start-new.svg" : "watch-stop-new.svg"} isLoading={isLoading} title={"Rave 2.0"}>
      <MenuBarExtra.Item icon={"watch-start-new.svg"} title={"Start"} onAction={isRunning ? undefined : () => onStart()} />
      <MenuBarExtra.Item icon={"watch-stop-new.svg"} title={"Stop"} onAction={!isRunning ? undefined : () => onStop()} />
      {isRunning && (
        <MenuBarExtra.Section>
          <MenuBarExtra.Item icon={"watch-terminal.svg"} title={"Open Terminal"} onAction={openTerminal} />
        </MenuBarExtra.Section>
      )}
    </MenuBarExtra>
  );
}
