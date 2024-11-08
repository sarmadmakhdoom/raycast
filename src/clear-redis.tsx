import {  showHUD } from "@raycast/api";
import { exec } from "child_process";

export default async function Command() {
  await exec("/opt/homebrew/bin/redis-cli flushall", () => {
  });

  await showHUD("Redis cleared successfully");
 
}
