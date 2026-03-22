export interface MessageReaction {
  id: number;
  emojiCode: string;
  userName: string;
}

export interface ItemHistory {
  id: number;
  author: string;
  changeDate: string;
  webViewLink?: string;
  googleFileId?: string;
  description: string;
  isPinned: boolean;
  edited: boolean;
  fileName?: string;

  reactions: MessageReaction[];
  replyTo?: ItemHistory;

  itemId?: number;
  pillarId?: number;
}
