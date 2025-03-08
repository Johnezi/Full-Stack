export type TItem = {
    id: string
    title: string
    parentContainerId: string
    secondaryTitle: string
    mainText: string
    cardColor: string
    tags: string
    versionText: string
    index: number
    createdTimestamp: string
    estimatedTime?: string
    actualTime?: string
    comments?: Comment[]
};

export type TContainer = {
    containerId: string
    header: string
    headerColor?: string 
    index: number 
};

export interface Comment {
    commentId: string
    text: string
    timestamp: string
    edited: boolean
}
