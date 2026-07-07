import { IntegrityEvidence, CompilerInput } from "./interfaces";

export class IntegrityScorer {
    public score(evidence: IntegrityEvidence): number {
        let score = 0;
        
        if (evidence.verifiedSource) score += 50;
        else if (evidence.verifiedABI) score += 30;

        if (evidence.openzeppelin) score += 15;
        if (evidence.proxyResolved) score += 20;
        if (evidence.dependencyCoverage > 0) score += 5;
        if (evidence.eventCoverage > 0) score += 10;

        return Math.min(100, score);
    }
}

export class IntegrityBuilder {
    public build(input: CompilerInput, extractedDeps: number, extractedEvents: number): IntegrityEvidence {
        return {
            verifiedABI: !!(input.abi && input.abi.length > 0),
            verifiedSource: !!input.source,
            openzeppelin: !!(input.source && input.source.includes("@openzeppelin")),
            proxyResolved: input.isProxy && !!input.implementation,
            dependencyCoverage: extractedDeps > 0 ? 1.0 : 0.0,
            eventCoverage: extractedEvents > 0 ? 1.0 : 0.0,
        };
    }
}
