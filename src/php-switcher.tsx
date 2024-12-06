import { MenuBarExtra, showToast, Toast } from "@raycast/api";
import { useExec } from "@raycast/utils";
import * as R from "lodash";
import { useCallback } from "react";

import { exec } from "node:child_process";

const execPromise = (command: string) =>
  new Promise<string>((resolve, reject) => {
    exec(command, { env: { HOME: process.env.HOME, PATH: "/opt/homebrew/opt/mysql-client@8.4/bin:/opt/homebrew/opt/mysql-client/bin:/Users/sarmadmakhdoom/Downloads/google-cloud-sdk/bin:/Users/sarmadmakhdoom/.nvm/versions/node/v18.15.0/bin:/Users/sarmadmakhdoom/scripts:/Library/Frameworks/Python.framework/Versions/2.7/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/Library/Apple/usr/bin:/usr/local/share/dotnet:~/.dotnet/tools:/usr/local/go/bin:/Library/Frameworks/Mono.framework/Versions/Current/Commands:/Applications/iTerm.app/Contents/Resources/utilities", } }, (error, stdout) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      console.log(stdout);
      resolve(stdout);
    });
  });


export default function Command() {
  const { data, isLoading } = useExec<string>(`/Users/sarmadmakhdoom/scripts/phpversion.sh`);
  const PHP_VERSIONS = ["7.4", "8.1", "8.2", "8.3"];
  const activeVersion = R.find(PHP_VERSIONS, (version) => (data || "").includes(version));

  const onAction = useCallback(async (version: string) => {
    await showToast({
      style: Toast.Style.Animated,
      message: "Refreshed",
      title: `Switching to PHP ${version}`,
    });
    await execPromise(`/opt/homebrew/bin/sphp ${version}`);
    await showToast({
      style: Toast.Style.Success,
      message: "Refreshed",
      title: `Switched to PHP ${version}`,
    });
  }, []);


  return (
    <MenuBarExtra isLoading={isLoading} title={activeVersion}>
      {PHP_VERSIONS.map((version) => (
        <MenuBarExtra.Item
          key={version}
          icon={"php.svg"}
          title={version}
          onAction={version !== activeVersion ? () => onAction(version) : undefined}
        />
      ))}
    </MenuBarExtra>
  );
}
