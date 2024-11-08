import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo, useState } from "react";
import R from 'lodash';
import moment from 'moment-timezone';
interface Timezone {
  title: string;
  timezone: string;
  subtitle?: string;
  default?: boolean;
}
const timezones: Timezone[] = [
  { title: 'Pakistan', timezone: 'Asia/Karachi', default: true },
  { title: 'UTC', timezone: 'UTC' },
  { title: 'EST', timezone: 'America/New_York' },
  { title: 'MST', timezone: 'America/Denver' },
  { title: 'Canada', timezone: 'America/Vancouver' },
  { title: 'Johannesburg', timezone: 'Africa/Johannesburg' },
]
export default function Command() {
  const [searchText, setSearchText] = useState("");
  
  const selectedTimezone = useMemo(() => {
    if(!searchText) return null;
    if(R.isEmpty(searchText)) return null;
    const toFindFrom  = R.get(searchText.toLowerCase().split(' '), '[0]', '')
    return timezones.find(tz => tz.title.toLowerCase().startsWith(toFindFrom))?.title
  }, [searchText])

  const parsedTime = useMemo(() => {
    if(!selectedTimezone) return searchText;
    const rest = searchText.split(' ');
    rest.splice(0, 1);
    return rest.join(' ');
  }, [searchText])


  const formattedTime = useMemo(() => {
    let hour = 0;
    let minute = 0;
    let ampm = 'am';
    const parts = parsedTime.split(':');
    if(parts.length === 2) {
      hour = parseInt(parts[0]);
      minute = parseInt(parts[1]);
    } else if(parts.length === 1) {
      hour = parseInt(parts[0]);
    }
    if(parsedTime.toLowerCase().includes('p')) {
      ampm = 'pm';
    }

    if(R.isNaN(hour)) hour = 0;
    if(R.isNaN(minute)) minute = 0;

    return `${hour}:${minute} ${ampm}`
  }, [parsedTime]);
  

  const items = useMemo(() => {
    return R.sortBy(timezones.map(tz => {
      
      let time = moment().tz(tz.timezone)
      if(parsedTime != '0:0 am' && parsedTime != ''){
        if(selectedTimezone){

          time = moment.tz(formattedTime, 'hh:mm a', timezones.find(t => t.title === selectedTimezone)!.timezone).tz(tz.timezone)
        }else{
          time = moment(formattedTime, 'hh:mm a').tz(tz.timezone)

        }
      }
      const subtitle = time.format('hh:mm A');
      const right = time.format('dddd, DD MMMM YYYY');
      return {tz, subtitle, right, sort: time.format('YY-MM-DD HH:mm') }
    }), 'sort')
  }, [parsedTime]);


  return <List filtering={false} navigationTitle="Timezone" searchBarPlaceholder="Search GrandCentral accounts..."  onSearchTextChange={setSearchText}>
    {items.map(item => 
       <List.Item key={item.tz.title} title={`${item.tz.title}`} subtitle={item.subtitle} icon={selectedTimezone === item.tz.title ? Icon.ArrowRight : Icon.Clock}  accessories={[{text: item.right }]}  />
    )}
    </List>;
}
