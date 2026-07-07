import express from "express";
import cors from "cors";
import path from "path";
import { HashGraphClient } from "../sdk/client";
import { MermaidExporter } from "../engine/export/mermaid";

const app = express();
app.use(cors());
app.use(express.static(path.join(process.cwd(), "src/dashboard")));

const client = new HashGraphClient();

app.get("/api/compile", async (req, res) => {
    try {
        const address = req.query.address as string;
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }
        const graph = await client.getProtocolGraph(address);
        const mermaid = MermaidExporter.generate(graph);
        
        // Compute compiler trace (mocking the trace format from Step 3)
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
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`HashGraph Dashboard running on http://localhost:${PORT}`);
    });
}

export default app;
