export interface ChatMessage {
  id: string;
  coinId: string;
  sender: string;
  text: string;
  timestamp: number;
}

let messages = $state<Record<string, ChatMessage[]>>({});

export function getMessages(coinId: string): ChatMessage[] {
  return messages[coinId] ?? [];
}

export function addMessage(msg: ChatMessage) {
  if (!messages[msg.coinId]) {
    messages[msg.coinId] = [];
  }
  messages[msg.coinId] = [...messages[msg.coinId], msg];
}
