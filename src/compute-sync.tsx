import { Action, ActionPanel, List, closeMainWindow, environment, showToast, Toast, showHUD } from "@raycast/api";
import { useFetch, usePromise } from "@raycast/utils";
import { useCallback, useEffect, useMemo, useRef } from "react";
import R from "lodash";
import { runAppleScript } from "run-applescript";
import fetch from 'node-fetch';

export default async function Command() {
  console.log("launchType", environment.launchType);
  // const { isLoading, data, revalidate } = useFetch<string>("http://gcp-helpers.local/sync");
  // const { isLoading, data, revalidate } = useFetch<string>("https://sarmad.me/");
  
  try{

    await fetch("http://gcp-helpers.local/sync", { timeout: 60000 }).then(async (res) => {
      console.log('Completed')
      await showHUD("Google Compute instances are synced");
    }).catch(err => {
      console.log(err)
    });
  }catch(error){
    console.log(error)
  }
  console.log('aa');

  // // const toast = await showToast(Toast.Style.Animated, "Syncing...", "Syncing your GCP data. This may take a few minutes.");
  // console.log('Running')vs
  // useEffect(() => {
  //   if(data){
  //     console.log(data);
  //   }
  //   if(!isLoading){
  //     closeMainWindow({ clearRootSearch: true });
  //     // toast.hide();
  //   }
  // })

 
}
