import { Clipboard, showToast, Toast, showHUD } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo, useState } from "react";
import R from 'lodash';
import fetch from 'node-fetch';


export default async function Command() {
  const text = await Clipboard.readText();
  if(!R.isEmpty(text)){
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Uploading to paste bin",
    });
    const response = await fetch("https://us-central1-s98-codebin.cloudfunctions.net/tos98paste", {
      method: 'POST',
      body: text,
      headers: {
        'Content-Type': 'text/plain'
      },
    });

    const url = await response.text();
    Clipboard.copy(url);;
    await showToast({ title: "Link Copied", message: url, style: Toast.Style.Success });
    // success emoji
    
    await showHUD("Link Copied to clipboard 🤗");
  } else {
    await showToast({ title: "No text in clipboard", message: "Please copy some text to clipboard", style: Toast.Style.Failure });
    await showHUD("No text on cliplboard");
  }

}