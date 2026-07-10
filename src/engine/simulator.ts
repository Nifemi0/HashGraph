import { createPublicClient, http, Address, Hex } from 'viem';

// Demo contracts + Blockscout live on HashKey Mainnet (chain id 177).
// Prefer HASHKEY_RPC_URL; fall back to public mainnet RPC.
const HASHKEY_MAINNET = {
  id: 177,
  name: "HashKey Mainnet",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: { default: { http: [process.env.HASHKEY_RPC_URL ?? process.env.RPC_URL ?? "https://mainnet.hsk.xyz"] } },
} as const;

export class TransactionSimulator {
    private client = createPublicClient({
        chain: HASHKEY_MAINNET,
        transport: http()
    });

    public async simulate(to: string, data: string, from?: string, value?: string): Promise<any> {
        try {
            const result = await this.client.call({
                to: to as Address,
                data: data as Hex,
                account: from ? (from as Address) : undefined,
                value: value ? BigInt(value) : undefined
            });
            return {
                status: "success",
                returnData: result.data || "0x",
            };
        } catch (e: any) {
            return {
                status: "reverted",
                error: e.shortMessage || e.message
            };
        }
    }

    public async read(address: string, data: string): Promise<any> {
        try {
            const result = await this.client.call({
                to: address as Address,
                data: data as Hex
            });
            return {
                status: "success",
                returnData: result.data || "0x"
            };
        } catch (e: any) {
            return {
                status: "reverted",
                error: e.shortMessage || e.message
            };
        }
    }
}
