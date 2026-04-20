import { Clipboard, showToast, Toast, showHUD } from "@raycast/api";
import R from 'lodash';
import fetch from 'node-fetch';


export default async function Command() {
  const text = await Clipboard.readText();
  if(!R.isEmpty(text)){
    await showToast({
      style: Toast.Style.Animated,
      title: "URL Shortening",
    });
    const response = await fetch("https://url-shortener-40503382464.us-central1.run.app/shorten", {
      method: 'POST',
      body: JSON.stringify({
        url: text
      }),
      headers: {
        'Content-Type': 'application/json'
      },
    });

    const url = await response.text();
    const output = JSON.parse(url).shortUrl.replace("https:/", "https://");

    Clipboard.copy(output);;
    await showToast({ title: "Link Copied", message: output, style: Toast.Style.Success });
    
    await showHUD("Link Copied to clipboard 🤗");
  } else {
    await showToast({ title: "No text in clipboard", message: "Please copy some text to clipboard", style: Toast.Style.Failure });
    await showHUD("No text on cliplboard");
  }

}