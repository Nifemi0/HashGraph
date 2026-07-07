import { IExplorerRepository } from "./repository.interface";

export interface NormalizedContractData {
  address: string;
  isProxy: boolean;
  implementationAddress: string | null;
  abi: string | null;
  sourceCode: string | null;
}

export class DataNormalizer {
  private repository: IExplorerRepository;

  // Dependency Inversion: Compiler doesn't know about Blockscout
  constructor(repository: IExplorerRepository) {
    this.repository = repository;
  }

  /**
   * Normalizes explorer data for the compiler.
   * Resolves proxy implementations automatically as per ADR-002 rules.
   */
  public async normalize(address: string): Promise<NormalizedContractData> {
    // Check if the contract is a proxy and resolve its implementation
    const implementationAddress = await this.repository.resolveProxyImplementation(address);
    const isProxy = !!implementationAddress;

    // As per the engineering review updates for ADR-002, we analyze the implementation
    // if the contract is a proxy.
    const targetAddress = implementationAddress || address;

    // Fetch both ABI and Source in parallel for efficiency
    const [abi, sourceCode] = await Promise.all([
      this.repository.fetchContractAbi(targetAddress),
      this.repository.fetchContractSource(targetAddress)
    ]);

    return {
      address,
      isProxy,
      implementationAddress,
      abi,
      sourceCode
    };
  }
}
