<script lang="ts">
  interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
  }

  let { coinId, messages = [] }: { coinId: string; messages?: Message[] } = $props();

  let input = $state('');
  let chatEl: HTMLDivElement;

  $effect(() => {
    if (chatEl) {
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  });

  function send() {
    if (!input.trim()) return;
    input = '';
  }

  function shorten(addr: string) {
    return addr.slice(0, 5) + '...' + addr.slice(-3);
  }
</script>

<div class="chat">
  <h3 class="chat-title">Chat</h3>

  <div class="messages" bind:this={chatEl}>
    {#if messages.length === 0}
      <p class="empty">No messages yet. Be the first to chat.</p>
    {:else}
      {#each messages as msg (msg.id)}
        <div class="msg">
          <span class="sender mono">{shorten(msg.sender)}</span>
          <span class="text">{msg.text}</span>
          <span class="time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
      {/each}
    {/if}
  </div>

  <form class="input-row" onsubmit={(e) => { e.preventDefault(); send(); }}>
    <input
      type="text"
      bind:value={input}
      placeholder="Type a message..."
      class="chat-input"
    />
    <button type="submit" class="send-btn" disabled={!input.trim()}>
      Send
    </button>
  </form>
</div>

<style>
  .chat {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 300px;
  }

  .chat-title {
    font-size: 1rem;
    font-weight: 600;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--gray-700);
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .empty {
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-align: center;
    margin: auto;
  }

  .msg {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .sender {
    font-size: 0.75rem;
    color: var(--accent);
    font-weight: 600;
  }

  .text {
    font-size: 0.875rem;
    color: var(--text-primary);
    word-break: break-word;
    overflow-wrap: break-word;
    min-width: 0;
  }

  .time {
    font-size: 0.6875rem;
    color: var(--text-secondary);
    margin-left: auto;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid var(--gray-700);
  }

  .chat-input {
    flex: 1;
    background: var(--bg-primary);
    border: 1px solid var(--gray-600);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--text-primary);
  }
  .chat-input::placeholder {
    color: var(--gray-500);
  }
  .chat-input:focus {
    border-color: var(--accent);
  }

  .send-btn {
    background: var(--accent);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  .send-btn:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
