import { Action, ActionPanel, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { Fragment, useMemo, useState } from "react";
import R from 'lodash';

interface RaveRetailerData {
  items: { 
    title: string;
    subtitle: string;
    arg: string;
    stageFrontend: string;
    hasStage: boolean;
    mods: {
      cmd: {
        arg: string;
      }
      shift: {
        arg: string;
      }
      alt: {
        arg: string;
      }
      ctrl: {
        arg: string;
      }
    }
    uid: string; }[]
}
export default function Command() {
  const {isLoading, data, revalidate} = useFetch<RaveRetailerData>("https://admin.raveretailer.com/alfred");
  const [search, setSearch] = useState<string>("");

  const items = useMemo(() => {
    if(!data) return [];
    return R.sortBy(data.items, ['title']);
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()) || item.uid.toString().toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);


  return <List isShowingDetail filtering={false} onSearchTextChange={setSearch} isLoading={isLoading} navigationTitle="Rave Retailer" searchBarPlaceholder="Search RaveRetailer websites...">
    {filteredItems.map(item => <List.Item key={item.uid} title={item.title}  icon={{source: 'rave.png'}}
    detail={
      <List.Item.Detail 
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="App ID" text={item.uid} />
          <List.Item.Detail.Metadata.Link title="URL" text={item.mods.cmd.arg} target={item.mods.cmd.arg} />
          {item.hasStage && (<Fragment>

          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Stage 1" />
          <List.Item.Detail.Metadata.Link title="Backend" text={item.mods.alt.arg} target={item.mods.alt.arg} />
          <List.Item.Detail.Metadata.Link title="Frontend" text={item.stageFrontend} target={item.stageFrontend} />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Stage 2" />
          <List.Item.Detail.Metadata.Link title="Backend" text={item.mods.alt.arg.replace('stage1', 'stage2')} target={item.mods.alt.arg.replace('stage1', 'stage2')} />
          <List.Item.Detail.Metadata.Link title="Frontend" text={item.stageFrontend.replace('raveretailer.dev', 'v2.raveretailer.dev')} target={item.stageFrontend.replace('raveretailer.dev', 'v2.raveretailer.dev')} />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Stage 3" />
          <List.Item.Detail.Metadata.Link title="Backend" text={item.mods.alt.arg.replace('stage1', 'stage3')} target={item.mods.alt.arg.replace('stage1', 'stage3')} />
          <List.Item.Detail.Metadata.Link title="Frontend" text={item.stageFrontend.replace('raveretailer.dev', 'v3.raveretailer.dev')} target={item.stageFrontend.replace('raveretailer.dev', 'v3.raveretailer.dev')} />
          </Fragment>)}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Local" />
          <List.Item.Detail.Metadata.Label title="URL" text={item.mods.shift.arg} />
          <List.Item.Detail.Metadata.Separator />
        </List.Item.Detail.Metadata>
      }
      />
    }
      actions={
      <ActionPanel>
        <Action.OpenInBrowser url={item.arg} />
        <Action.OpenInBrowser url={item.mods.cmd.arg} title={`Open ${item.mods.cmd.arg}`} />
        <Action.CopyToClipboard content={item.uid} title="Copy Tenant ID" shortcut={{modifiers: ['cmd', 'shift'], key: 'c'}} />
        <Action.OpenInBrowser url={item.mods.shift.arg} title={`Open ${item.mods.shift.arg}`} shortcut={{modifiers: ['shift'], key: 'return'}} />
        <Action.OpenInBrowser url={item.mods.alt.arg} title={`Open Stage 1 - Backend`} shortcut={{modifiers: ['cmd'], key: '1'}} />
        <Action.OpenInBrowser url={item.mods.alt.arg.replace('stage1', 'stage2')} title={`Open Stage 2 - Backend`} shortcut={{modifiers: ['cmd'], key: '2'}} />
        <Action.OpenInBrowser url={item.mods.alt.arg.replace('stage1', 'stage3')} title={`Open Stage 3 - Backend`} shortcut={{modifiers: ['cmd'], key: '3'}} />

        <Action.OpenInBrowser url={item.stageFrontend} title={`Open Stage 1 - Frontend`} shortcut={{modifiers: ['cmd', 'opt'], key: '1'}} />
        <Action.OpenInBrowser url={item.stageFrontend.replace('raveretailer.dev', 'v2.raveretailer.dev')} title={`Open Stage 2 - Frontend`} shortcut={{modifiers: ['cmd', 'opt'], key: '2'}} />
        <Action.OpenInBrowser url={item.stageFrontend.replace('raveretailer.dev', 'v3.raveretailer.dev')} title={`Open Stage 3 - Frontend`} shortcut={{modifiers: ['cmd', 'opt'], key: '3'}} />
        
      </ActionPanel>
    } />)}
    </List>;
}
