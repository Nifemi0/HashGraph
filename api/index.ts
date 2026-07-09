import express from "express";
import cors from "cors";
import { isAddress } from "viem";
import { HashGraphClient } from "../src/sdk/client";
import { MermaidExporter } from "../src/engine/export/mermaid";

const app = express();
app.use(cors());

const client = new HashGraphClient();

// Simple in-memory IP rate limiter for basic protection
const ipCache = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 30; // 30 requests per minute
const WINDOW = 60 * 1000;

const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "unknown").split(",")[0].trim();
    const now = Date.now();
    const clientLimit = ipCache.get(ip);
    
    if (!clientLimit) {
        ipCache.set(ip, { count: 1, lastReset: now });
        return next();
    }
    
    if (now - clientLimit.lastReset > WINDOW) {
        ipCache.set(ip, { count: 1, lastReset: now });
        return next();
    }
    
    if (clientLimit.count >= LIMIT) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    
    clientLimit.count += 1;
    next();
};

const handler = async (req: express.Request, res: express.Response) => {
    try {
        const address = req.query.address as string;
        if (!address || !isAddress(address)) {
            return res.status(400).json({ 
                error: "Invalid contract address",
                expected: "0x-prefixed EVM address"
            });
        }
        const graph = await client.getProtocolGraph(address);
        const mermaid = MermaidExporter.generate(graph);
        
        const trace = [
            `Compiler Trace for ${address}`,
            `Compiled in ${graph.statistics.compile_time_ms}ms`,
            `Found ${graph.statistics.roles} roles`,
            `Found ${graph.statistics.events} events`,
            `Found ${graph.statistics.dependencies} dependencies`
        ].join("\\n");

        res.json({
            graph,
            mermaid,
            trace
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

app.get("/api/compile", rateLimiter, handler);
app.get("/api/analyze", rateLimiter, handler);

// Vercel routes everything under /api to this file if named api/index.ts.
// But to be safe for root matching if we rewrite:
app.get("/api", (req, res) => {
    res.json({ status: "ok" });
});

export default app;
