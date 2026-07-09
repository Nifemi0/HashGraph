import { createPublicClient, http, Address, Hex, parseAbi } from 'viem';

const HASHKEY_TESTNET = {
  id: 133,
  name: "HashKey Testnet",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: { default: { http: [process.env.HASHKEY_TESTNET_RPC_URL ?? "https://testnet.hsk.xyz"] } },
} as const;

export class TransactionSimulator {
    private client = createPublicClient({
        chain: HASHKEY_TESTNET,
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
