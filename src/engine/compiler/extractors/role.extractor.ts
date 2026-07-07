import { CompilerInput, GraphExtractor, RoleResult, RoleItem } from "../interfaces";

export class RoleExtractor implements GraphExtractor<RoleResult> {
    public name = "RoleExtractor";

    public async extract(input: CompilerInput): Promise<RoleResult> {
        const rolesMap = new Map<string, RoleItem>();

        if (input.abi) {
            for (const item of input.abi) {
                if (item.type === "function") {
                    if (item.name === "owner" || item.name === "transferOwnership") {
                        rolesMap.set("Owner", { name: "Owner", source: "ABI", confidence: 1.0, evidence: `${item.name}()` });
                    }
                    if (item.name === "hasRole") {
                        rolesMap.set("AccessControl", { name: "AccessControl", source: "ABI", confidence: 1.0, evidence: "hasRole(bytes32,address)" });
                    }
                    if (item.name === "MINTER_ROLE") {
                        rolesMap.set("Minter", { name: "Minter", source: "ABI", confidence: 1.0, evidence: "MINTER_ROLE()" });
                    }
                }
            }
        }

        if (input.source) {
            if (input.source.includes("contract Ownable") || input.source.includes("is Ownable")) {
                if (!rolesMap.has("Owner")) {
                    rolesMap.set("Owner", { name: "Owner", source: "Source", confidence: 0.9, evidence: "Inherits Ownable" });
                }
            }
        }

        return { roles: Array.from(rolesMap.values()) };
    }
}
