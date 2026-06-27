import { http, createConfig } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});
