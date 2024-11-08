import { Action, ActionPanel, List, closeMainWindow, environment, showToast, Toast, showHUD } from "@raycast/api";
import { useExec, useFetch, usePromise } from "@raycast/utils";
import { useCallback, useEffect, useMemo, useRef } from "react";
import R from "lodash";
import { runAppleScript } from "run-applescript";
import fetch from 'node-fetch';
import { exec } from "child_process";

export default async function Command() {
  await exec("/opt/homebrew/bin/redis-cli flushall", (error, stdout, stderr) => {
  });

  await showHUD("Redis cleared successfully");
 
}
