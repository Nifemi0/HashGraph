import express from "express";
import cors from "cors";
import { HashGraphClient } from "../src/sdk/client";
import { MermaidExporter } from "../src/engine/export/mermaid";

const app = express();
app.use(cors());

const client = new HashGraphClient();

const handler = async (req: express.Request, res: express.Response) => {
    try {
        const address = req.query.address as string;
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
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

app.get("/api/compile", handler);
app.get("/api/analyze", handler);

// Vercel routes everything under /api to this file if named api/index.ts.
// But to be safe for root matching if we rewrite:
app.get("/api", (req, res) => {
    res.json({ status: "ok" });
});

export default app;
