import { Action, ActionPanel, Color, Detail, Icon, LaunchProps, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo, useState } from "react";
import R from 'lodash';
import moment from 'moment-timezone';


export default function Command() {
  const [search, setSearch] = useState("");
  const m = useMemo(() => {
    if(search.length === 0) {
      return moment();
    }
    return moment.unix(R.toNumber(search));
  },[search]);

  return <List isShowingDetail isLoading={false} onSearchTextChange={setSearch}>
    <List.Item  title={m.unix().toString()} detail={
      <List.Item.Detail 
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Epoch" text={m.unix().toString()} />
         
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Local" text={m.format('dddd, MMMM Do YYYY, h:mm:ss a')} />
          <List.Item.Detail.Metadata.Label title="UTC" text={m.tz('UTC').format('dddd, MMMM Do YYYY, h:mm:ss a')} />
          <List.Item.Detail.Metadata.Label title="EST" text={m.tz('America/New_York').format('dddd, MMMM Do YYYY, h:mm:ss a')} />
          <List.Item.Detail.Metadata.Label title="Pacific" text={m.tz('America/Vancouver').format('dddd, MMMM Do YYYY, h:mm:ss a')} />
          <List.Item.Detail.Metadata.Separator />
        </List.Item.Detail.Metadata>
      }
      />
     
      
    }  actions={
      <ActionPanel>
    <Action.CopyToClipboard content={m.unix()} title="Copy Unix" shortcut={{modifiers: ['cmd', 'shift'], key: 'c'}} />    
      </ActionPanel>
    }  />
    </List>
  
}