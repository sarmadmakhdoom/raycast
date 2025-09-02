import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo, useState } from "react";
import R from 'lodash';

interface RaveRetailerData {
  items: { 
    title: string;
    subtitle: string;
    arg: string;
    uid: string; }[]
}
export default function Command() {
  const {isLoading, data} = useFetch<RaveRetailerData>("https://api.studio98.ai/api/admin/raycast");
  const [search, setSearch] = useState<string>("");

  const items = useMemo(() => {
    if(!data) return [];
    return R.sortBy(data.items, ['title']);
  }, [])

  const filteredItems = useMemo(() => {
    
    return items.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()) || item.uid.toString().toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);


  return <List filtering={false} onSearchTextChange={setSearch} isLoading={isLoading} navigationTitle="Studio98.al" searchBarPlaceholder="Search Studio98 AI accounts...">
    {filteredItems.map(item => <List.Item key={item.uid} title={item.title} icon={{source: 'ai98.png'}} 
    accessories={[{text: {value: item.uid.toString(), color: Color.SecondaryText}, icon: Icon.CopyClipboard}]}
     actions={
      <ActionPanel>
        <Action.OpenInBrowser url={item.arg} />
        <Action.CopyToClipboard content={item.uid} title="Copy Tenant Id" shortcut={{modifiers: ['cmd', 'shift'], key: 'c'}} />
        
      </ActionPanel>
    } />)}
    </List>;
}
