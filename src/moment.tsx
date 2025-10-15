import { Action, ActionPanel, List } from "@raycast/api";
import { useMemo, useState } from "react";
import R from "lodash";
import moment from "moment-timezone";

export default function Command() {
  const [search, setSearch] = useState("");
  const m = useMemo(() => {
    if (search.length === 0) {
      return moment();
    }
    return moment.unix(R.toNumber(search));
  }, [search]);

  return (
    <List isLoading={false} onSearchTextChange={setSearch}>
      <List.Item
        title="Epoch"
        accessories={[{ text: m.unix().toString() }]}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard
              content={m.unix()}
              title="Copy Unix"
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          </ActionPanel>
        }
      />
      <List.Item title="Local" accessories={[{ text: m.format("dddd, MMMM Do YYYY, h:mm:ss a") }]} />
      <List.Item title="UTC" accessories={[{ text: m.tz("UTC").format("dddd, MMMM Do YYYY, h:mm:ss a") }]} />
      <List.Item
        title="EST"
        accessories={[{ text: m.tz("America/New_York").format("dddd, MMMM Do YYYY, h:mm:ss a") }]}
      />
      <List.Item
        title="MST"
        accessories={[{ text: m.tz("America/Denver").format("dddd, MMMM Do YYYY, h:mm:ss a") }]}
      />
      <List.Item
        title="Pacific"
        accessories={[{ text: m.tz("America/Vancouver").format("dddd, MMMM Do YYYY, h:mm:ss a") }]}
      />

     
    </List>
  );
}
