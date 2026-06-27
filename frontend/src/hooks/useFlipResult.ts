export function useFlipResult() {
  function onFlip(handler: (result: { coinId: string; winner: boolean; amount: bigint }) => void) {
    return () => {};
  }

  return { onFlip };
}
