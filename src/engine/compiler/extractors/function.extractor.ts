import { CompilerInput, GraphExtractor, FunctionResult, FunctionItem } from "../interfaces";

export class FunctionExtractor implements GraphExtractor<FunctionResult> {
    public name = "FunctionExtractor";

    public async extract(input: CompilerInput): Promise<FunctionResult> {
        const privileged: FunctionItem[] = [];
        const publicFuncs: FunctionItem[] = [];

        if (input.abi) {
            for (const item of input.abi) {
                if (item.type === "function") {
                    const isViewOrPure = item.stateMutability === "view" || item.stateMutability === "pure";
                    
                    const isPrivileged = !isViewOrPure && (
                        item.name.startsWith("set") ||
                        item.name.startsWith("update") ||
                        item.name === "pause" ||
                        item.name === "unpause" ||
                        item.name === "mint" ||
                        item.name === "burn" ||
                        item.name === "transferOwnership" ||
                        item.name === "upgradeTo"
                    );

                    const visibility = (item.stateMutability === "private" || item.stateMutability === "internal") 
                        ? item.stateMutability : "external";

                    if (isPrivileged) {
                        privileged.push({
                            name: item.name,
                            classification: "privileged",
                            reason: "state mutation heuristic",
                            visibility
                        });
                    } else if (visibility !== "private" && visibility !== "internal") {
                        publicFuncs.push({
                            name: item.name,
                            classification: isViewOrPure ? "read-only" : "public mutator",
                            reason: isViewOrPure ? "no state mutation" : "standard state mutation",
                            visibility
                        });
                    }
                }
            }
        }

        return { 
            privileged_functions: privileged, 
            public_functions: publicFuncs 
        };
    }
}
