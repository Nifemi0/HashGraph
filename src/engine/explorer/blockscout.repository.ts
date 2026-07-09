import Bottleneck from "bottleneck";
import { z } from "zod";
import { IExplorerRepository } from "./repository.interface";
import { 
  ExplorerAPIError, 
  ExplorerDataError, 
  ExplorerRateLimitError, 
  ExplorerTimeoutError 
} from "../errors";

// Blockscout returns generic responses matching this shape
const BlockscoutResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  result: z.any()
});

export class BlockscoutRepository implements IExplorerRepository {
  private baseUrl: string;
  private limiter: Bottleneck;

  constructor(baseUrl: string = "https://hashkey.blockscout.com/api") {
    this.baseUrl = baseUrl;
    
    // Bottleneck handles concurrency and rate limiting
    // Setting to max 5 requests per second to avoid hitting 429 limits
    this.limiter = new Bottleneck({
      minTime: 200,
      maxConcurrent: 5
    });
  }

  /**
   * Internal method wrapping fetch with rate limiter and exponential backoff.
   */
  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.limiter.schedule(() => this.makeRequest(url));
      } catch (error) {
        // Only retry on rate limits or 5xx server errors
        if (error instanceof ExplorerRateLimitError || 
           (error instanceof ExplorerAPIError && error.statusCode && error.statusCode >= 500)) {
          if (i === retries - 1) throw error;
          const backoff = 1000 * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, backoff));
        } else {
          // Immediately throw on 400s or data errors
          throw error;
        }
      }
    }
  }

  private async makeRequest(url: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new ExplorerRateLimitError();
      }

      if (!response.ok) {
        throw new ExplorerAPIError(`HTTP Error: ${response.statusText}`, response.status);
      }

      const rawData = await response.json();
      
      // Strict Zod validation on the boundary
      const parsedData = BlockscoutResponseSchema.safeParse(rawData);
      if (!parsedData.success) {
        throw new ExplorerDataError("Invalid response schema from Blockscout");
      }

      return parsedData.data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new ExplorerTimeoutError();
      }
      throw error;
    }
  }

  public async fetchContractAbi(address: string): Promise<string | null> {
    try {
      const url = `${this.baseUrl}?module=contract&action=getabi&address=${address}`;
      const data = await this.fetchWithRetry(url);
      
      // Status "1" means success/verified. Status "0" usually means unverified.
      if (data.status === "1" && typeof data.result === "string") {
        return data.result;
      }
    } catch (e) {
      console.warn(`[Blockscout] Failed to fetch ABI for ${address}, trying local fallback...`);
    }

    // Local Fallbacks for demo contracts
    if (address.toLowerCase() === "0xb210d2120d57b758ee163cffb43e73728c471cf1".toLowerCase()) {
      return '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
    }
    if (address.toLowerCase() === "0x4200000000000000000000000000000000000015".toLowerCase()) {
      return '[{"inputs":[{"internalType":"address","name":"_admin","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"stateMutability":"payable","type":"receive"}]';
    }
    if (address.toLowerCase() === "0x4200000000000000000000000000000000000016".toLowerCase()) {
      return '[{"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]';
    }

    return null;
  }

  public async fetchContractSource(address: string): Promise<string | null> {
    const url = `${this.baseUrl}?module=contract&action=getsourcecode&address=${address}`;
    const data = await this.fetchWithRetry(url);
    
    if (data.status === "1" && Array.isArray(data.result) && data.result.length > 0) {
      if (data.result[0].SourceCode) {
         return data.result[0].SourceCode;
      }
    }
    return null;
  }

  public async resolveProxyImplementation(address: string): Promise<string | null> {
    const url = `${this.baseUrl}?module=contract&action=getsourcecode&address=${address}`;
    const data = await this.fetchWithRetry(url);
    
    if (data.status === "1" && Array.isArray(data.result) && data.result.length > 0) {
      const contract = data.result[0];
      // Blockscout / Etherscan format for proxy tracking
      if (contract.Proxy === "1" && contract.Implementation) {
        return contract.Implementation;
      }
    }
    return null;
  }
}
