import { getPreferenceValues, MenuBarExtra, showToast, Toast } from "@raycast/api";
import { runAppleScript, useExec } from "@raycast/utils";
import { useCallback, useMemo } from "react";

import { exec } from "node:child_process";

const execPromise = (command: string, scriptPath: string) =>
  new Promise<string>((resolve, reject) => {
    exec(
      command,
      {
        env: {
          HOME: process.env.HOME,
          PATH: `${scriptPath}:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/go/bin`,
        },
      },
      (error, stdout) => {
        if (error) {
          console.log(error);
          reject(error);
        }
        console.log(stdout);
        resolve(stdout);
      },
    );
  });

interface ListData {
  session: string;
  name: string;
  path: string;
  npm: string;
}

const PROJECT_LIST: Record<string, ListData> = {
  PROJECT_RAVE_V2: { session: "rave", path: "", name: "Rave", npm: '18' },
  PROJECT_GC: { session: "gc", path: "", name: "GC", npm: '18' },
  PROJECT_YESA: { session: "yesa", path: "", name: "YESA", npm: '15.14.0' },
  PROJECT_SUCCEED: { session: "succeed", path: "", name: "Succeed", npm: '18' },
};

export default function Command() {
  const { ScriptsPath, ...projectValues } = getPreferenceValues();
  const { data, isLoading, revalidate } = useExec<string[]>(`${ScriptsPath}/tmuxsessions.sh`, {
    keepPreviousData: false,
  });

  const activeProjects = useMemo(() => {
    const projectKeys = Object.keys(PROJECT_LIST);
    return projectKeys
      .filter((key: string) => projectValues[key])
      .map((key) => ({
        ...PROJECT_LIST[key],
        path: projectValues[key + "_PATH"],
        running: (data || []).includes(PROJECT_LIST[key].session),
      }));
  }, [projectValues]);

  const runningProjects = useMemo(() => activeProjects.filter((project) => project.running), [activeProjects]);


  const onStop = useCallback(
    async (session: string) => {
      await execPromise(`tmux kill-session -t ${session}`, ScriptsPath);
      revalidate();
      await showToast({
        style: Toast.Style.Failure,
        message: "Refreshed",
        title: `Watch Stopped`,
      });
    },
    [revalidate, ScriptsPath],
  );

  const onStart = useCallback(async (session: string, path: string, npm: string) => {
    console.log(`watch.sh ${session} ${path} ${npm}`);
    await execPromise(`watch.sh ${session} ${path} "${npm}"`, ScriptsPath);
    revalidate();
    await showToast({
      style: Toast.Style.Success,
      message: "Refreshed",
      title: `Started Watch`,
    });
  }, [revalidate, ScriptsPath]);

  const openTerminal = useCallback((session: string) => {
    runAppleScript(`tell application "iTerm2"
          create window with default profile
            tell current session of current window
                write text "tmux attach -t ${session}"
            end tell
        end tell
      
      `);
  }, []);

  return (
    <MenuBarExtra icon={runningProjects.length ? "watch-start-new.svg" : "watch-stop-new.svg"} isLoading={isLoading} title={runningProjects.length > 0 ? runningProjects.map(a => a.name).join(', '): 'Not Running'}>
      {activeProjects.map((project) => (
        <MenuBarExtra.Submenu icon={project.running ? 'watch-start-new.svg' : 'watch-stop-new.svg'} title={project.name} key={project.name}>
          <MenuBarExtra.Item
            // icon={"watch-start-new.svg"}
            title={"Start Watch"}
            onAction={project.running ? undefined : () => onStart(project.session, project.path, project.npm)}
          />
          <MenuBarExtra.Item
            // icon={"watch-stop-new.svg"}
            title={"Stop Watch"}
            onAction={!project.running ? undefined : () => onStop(project.session)}
          />
          {project.running && (
            <MenuBarExtra.Section>

              <MenuBarExtra.Item icon={"watch-terminal.svg"} title={"Open Terminal"} onAction={() => openTerminal(project.session)} />
            </MenuBarExtra.Section>
          )}
        </MenuBarExtra.Submenu>
      ))}
    </MenuBarExtra>
  );
}
