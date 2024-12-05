export interface ClickupTask {
    id: string;
    custom_id: string | null;
    custom_item_id: number;
    name: string;
    text_content: string;
    description: string;
    status: Status;
    orderindex: string;
    date_created: string;
    date_updated: string;
    date_closed: string | null;
    date_done: string | null;
    archived: boolean;
    creator: User;
    assignees: User[];
    group_assignees: any[]; // Replace with a specific type if needed
    watchers: User[];
    checklists: any[]; // Replace with a specific type if needed
    tags: Tag[];
    parent: string | null;
    top_level_parent: string | null;
    priority: Priority;
    due_date: string | null;
    start_date: string | null;
    points: number | null;
    time_estimate: number;
    time_spent: number;
    custom_fields: CustomField[];
    dependencies: any[]; // Replace with a specific type if needed
    linked_tasks: any[]; // Replace with a specific type if needed
    locations: Location[];
    team_id: string;
    url: string;
    sharing: Sharing;
    permission_level: string;
    list: Entity;
    project: Entity;
    folder: Entity;
    space: Space;
    attachments: any[]; // Replace with a specific type if needed
}

interface Status {
    id: string;
    status: string;
    color: string;
    orderindex: number;
    type: string;
}

interface User {
    id: number;
    username: string;
    color: string;
    initials: string;
    email: string;
    profilePicture: string | null;
}

interface Tag {
    name: string;
    tag_fg: string;
    tag_bg: string;
    creator: number;
}

interface Priority {
    color: string;
    id: string;
    orderindex: string;
    priority: string;
}

interface CustomField {
    id: string;
    name: string;
    type: string;
    type_config: any; // Replace with a specific type if needed
    date_created: string;
    hide_from_guests: boolean;
    required: boolean;
    value?: string;
    value_richtext?: any; // Replace with a specific type if needed
}

interface Location {
    id: string;
    name: string;
}

interface Sharing {
    public: boolean;
    public_share_expires_on: string | null;
    public_fields: string[];
    token: string | null;
    seo_optimized: boolean;
}

interface Entity {
    id: string;
    name: string;
    access: boolean;
    hidden?: boolean;
}

interface Space {
    id: string;
}