import { addMessage, getMessages, type ChatMessage } from '$store/chatStore.svelte';

export function useChat(coinId: string) {
  function send(text: string) {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      coinId,
      sender: '0x0000...0000',
      text,
      timestamp: Date.now(),
    };
    addMessage(msg);
  }

  function getMessagesForCoin() {
    return getMessages(coinId);
  }

  return { send, getMessages: getMessagesForCoin };
}
