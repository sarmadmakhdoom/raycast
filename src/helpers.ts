import { getFrontmostApplication, open } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import R from "lodash";
const DEFAULT_TERMINAL: "iterm2" | "warp" = "warp";
export async function openInTerminal(command: string | string []) {
  if (DEFAULT_TERMINAL == "iterm2") {
    await openInIterm2(command);
  } else {
    await openInWarp(command);
  }
}

export async function openInIterm2(command: string | string[]) {
  const defaultApplication = await getFrontmostApplication();
  if (defaultApplication.name === "iTerm2") {
    await runAppleScript(`
       tell application "iTerm2"
         tell current window
         create tab with default profile command "${command}"
         activate
         end tell
       end tell
       `);
  } else {
    await runAppleScript(`
       tell application "iTerm2"
         create window with default profile command "${command}"
         activate
       end tell
       `);
  }
}

export async function openInWarp(command: string | string[]) {
  await runWarpCommand(command);
}

async function runWarpCommand(command: string | string[]) {
  const warpConfigDir = path.join("/Users/sarmadmakhdoom", ".warp/launch_configurations");

  // Ensure the Warp configuration directory exists
  if (!fs.existsSync(warpConfigDir)) {
    fs.mkdirSync(warpConfigDir, { recursive: true });
  }


  // Remove all files starting with `dynamic_command_` in the Warp configuration directory
  fs.readdirSync(warpConfigDir).forEach((file) => {
    if (file.startsWith("dynamic_command_")) {
      fs.unlinkSync(path.join(warpConfigDir, file));
    }
  });
  // Generate a unique configuration file name
  const configName = `dynamic_command_${Date.now()}.yaml`;
  const name = `dc_${Date.now()}`;
  const configPath = path.join(warpConfigDir, configName);

  
  if(R.isArray(command)){
    const config = {
      name,
      windows: [
        {
          tabs: [{
            layout: {
              split_direction: "horizontal",
              panes: command.map(c => ({ cwd: "~", commands: [{ exec: c }] }))
            }
          }]
        },
      ],
    };
  
    fs.writeFileSync(configPath, yaml.stringify(config), "utf8");
    
  }else{

    const config = {
      name,
      windows: [
        {
          tabs: [
            {
              layout: {
                cwd: "~",
                commands: [
                  {
                    exec: command,
                  },
                ],
              },
            },
          ],
        },
      ],
    };
  
    fs.writeFileSync(configPath, yaml.stringify(config), "utf8");
  }
  
  await open(`warp://launch/${encodeURIComponent(name)}`);


}
