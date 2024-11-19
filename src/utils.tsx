import { open, MenuBarExtra } from "@raycast/api";
import { useCallback } from "react";
import { useExec, runAppleScript } from "@raycast/utils";

import R from "lodash";
export default function Command() {
  const PHP_VERSIONS = ["7.4", "8.1", "8.2"];

  const { revalidate: stopProxy } = useExec("pkill", ["-9", "cloud_sql_proxy"], { execute: false });
  const { isLoading, data } = useExec("pgrep", ["-x", "cloud_sql_proxy", "|| true"], {
    keepPreviousData: false,
    shell: true,
    execute: true,
  });

  const onStartProxy = useCallback(() => {
    //
    runAppleScript(`tell application "iTerm2"
    create window with default profile
      tell current session of current window
          write text "run_proxy"
      end tell
  end tell
`);
  }, []);

  const openFile = useCallback((path: string) => {
    open(`vscode://file/${path}`);
  }, []);

  return (
    <MenuBarExtra isLoading={isLoading} icon={R.toNumber(data) > 0 ? "db-check.svg" : "db-uncheck.svg"} title={"SQL"}>
      {R.toNumber(data) == 0 && (
        <MenuBarExtra.Item icon="start.svg" title="Start SQL Proxy" onAction={() => onStartProxy()} />
      )}
      {R.toNumber(data) > 0 && (
        <MenuBarExtra.Item icon="stop.svg" title="Stop SQL Proxy" onAction={() => stopProxy()} />
      )}
      <MenuBarExtra.Section>
        <MenuBarExtra.Submenu icon="server.svg" title="apache">
          <MenuBarExtra.Item title="httpd.conf" onAction={() => openFile("/opt/homebrew/etc/httpd/httpd.conf")} />
          <MenuBarExtra.Item
            title="httpd-vhosts.conf"
            onAction={() => openFile("/opt/homebrew/etc/httpd/extra/httpd-vhosts.conf")}
          />
          <MenuBarExtra.Item
            title="httpd-httpd-ssl.conf"
            onAction={() => openFile("/opt/homebrew/etc/httpd/extra/httpd-ssl.conf")}
          />
        </MenuBarExtra.Submenu>
        {PHP_VERSIONS.map((version) => (
          <MenuBarExtra.Submenu icon="php.svg" key={version} title={`php${version}`}>
            <MenuBarExtra.Item title="php.ini" onAction={() => openFile(`/opt/homebrew/etc/php/${version}/php.ini`)} />
          </MenuBarExtra.Submenu>
        ))}
        <MenuBarExtra.Section>
          <MenuBarExtra.Item icon="file.svg" title="host" onAction={() => openFile("/etc/hosts")} />
          
        </MenuBarExtra.Section>
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
