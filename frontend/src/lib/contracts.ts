import CoinFactoryAbi from '../../contracts/out/CoinFactory.sol/CoinFactory.json' with { type: 'json' };
import RugPoolAbi from '../../contracts/out/RugPool.sol/RugPool.json' with { type: 'json' };
import TreasuryAbi from '../../contracts/out/Treasury.sol/Treasury.json' with { type: 'json' };
import VRFConsumerAbi from '../../contracts/out/VRFConsumer.sol/VRFConsumer.json' with { type: 'json' };
import MemberRegistryAbi from '../../contracts/out/MemberRegistry.sol/MemberRegistry.json' with { type: 'json' };

export const RUG_POOL_ADDRESS = '0x1b68e000bb7788477d7a9a3f0315beea71501652';
export const COIN_FACTORY_ADDRESS = '0x0ca6bdf6c87d44d2e8319ff7815b339789591a6d';
export const TREASURY_ADDRESS = '0xeb1ad588ccadca76564e2e387f71e48ec13244bd';
export const VRF_CONSUMER_ADDRESS = '0x2e221582f32c5f5c773ae5c3947abd8a06ae8482';
export const MEMBER_REGISTRY_ADDRESS = '0x4491a42c7ec1c4b79b393d1693ea9ca0b6d574c6';

export const RUG_POOL_ABI = RugPoolAbi.abi;
export const COIN_FACTORY_ABI = CoinFactoryAbi.abi;
export const TREASURY_ABI = TreasuryAbi.abi;
export const VRF_CONSUMER_ABI = VRFConsumerAbi.abi;
export const MEMBER_REGISTRY_ABI = MemberRegistryAbi.abi;
