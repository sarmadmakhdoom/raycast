import { closeMainWindow, LaunchProps, showHUD, showToast, Toast } from "@raycast/api";
import { spawn } from "child_process";

const execPromiseIncremental = (command: string, params: string[]) =>
  new Promise<string>((resolve, reject) => {
    const instance = spawn(command, params);
    instance.stdout.on("data", (data) => {
      showToast({
        style: Toast.Style.Animated,
        title: data,
      });
    });
    instance.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      // showToast({
      //   style: Toast.Style.Failure,
      //   title: data,
      // });
      // reject(data);

    });

    instance.on('exit', () => {
      resolve("exit");
    })
  });

export default async function Command(props: LaunchProps) {
  const {project, instance, database, dbName, domain, isImport, DOWNLOAD_PATH, ScriptsPath} = props.arguments;
  closeMainWindow();
  await showToast({
    style: Toast.Style.Animated,
    message: "Refreshed",
    title: `Downloading database ${database}`,
  });

  const output = await execPromiseIncremental(`${ScriptsPath}/gsql-raycast`,  [project, instance, database, dbName, domain, isImport, DOWNLOAD_PATH])
  console.log(output)

  await showToast({
      style: Toast.Style.Success,
      message: "Refreshed",
      title: "Database downloaded successfully",
  });

}