import type { TopicNode, DependencyEdge, StudyPath } from '../types';

export const calculateOrbits = (nodes: TopicNode[], edges: DependencyEdge[]): TopicNode[] => {
    const depthMap = new Map<string, number>();

    // Initialize depths
    nodes.forEach(n => depthMap.set(n.id, 0));

    // Simple relaxation to find depths (assuming DAG)
    let changed = true;
    let iterations = 0;
    while (changed && iterations < nodes.length) {
        changed = false;
        edges.forEach(edge => {
            const sourceDepth = depthMap.get(edge.source) || 0;
            const targetDepth = depthMap.get(edge.target) || 0;

            if (sourceDepth + 1 > targetDepth) {
                depthMap.set(edge.target, sourceDepth + 1);
                changed = true;
            }
        });
        iterations++;
    }

    const nodesByDepth = new Map<number, TopicNode[]>();
    nodes.forEach(n => {
        const d = depthMap.get(n.id) || 0;
        if (!nodesByDepth.has(d)) nodesByDepth.set(d, []);
        nodesByDepth.get(d)?.push(n);
    });

    return nodes.map(n => {
        const depth = depthMap.get(n.id) || 0;
        const layerNodes = nodesByDepth.get(depth) || [];
        const index = layerNodes.indexOf(n);
        const totalInLayer = layerNodes.length;

        // Radius increases with depth
        const radius = 15 + depth * 8;

        // Distribute around the circle
        const angle = (index / totalInLayer) * Math.PI * 2;
        // Add some randomness or 3D variation
        const y = (Math.random() - 0.5) * 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return {
            ...n,
            depth,
            position: [x, y, z]
        };
    });
};

export const computePath = (nodes: TopicNode[], edges: DependencyEdge[], startId: string, endId: string): StudyPath | null => {
    // A* Implementation
    const openSet = new Set<string>([startId]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    nodes.forEach(n => {
        gScore.set(n.id, Infinity);
        fScore.set(n.id, Infinity);
    });

    gScore.set(startId, 0);

    const startNode = nodes.find(n => n.id === startId);
    const endNode = nodes.find(n => n.id === endId);

    if (!startNode || !endNode) return null;

    // Heuristic: Euclidean distance between nodes (if positions exist)
    const h = (id: string) => {
        const node = nodes.find(n => n.id === id);
        if (!node || !node.position || !endNode.position) return 0;
        const [x1, y1, z1] = node.position;
        const [x2, y2, z2] = endNode.position;
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
    };

    fScore.set(startId, h(startId));

    while (openSet.size > 0) {
        // Get node with lowest fScore
        let current = Array.from(openSet).reduce((a, b) =>
            (fScore.get(a) || Infinity) < (fScore.get(b) || Infinity) ? a : b
        );

        if (current === endId) {
            // Reconstruct path
            const path = [current];
            while (cameFrom.has(current)) {
                current = cameFrom.get(current)!;
                path.unshift(current);
            }

            // Calculate total time
            const totalTime = path.reduce((acc, id) => {
                const n = nodes.find(node => node.id === id);
                return acc + (n?.estimatedTime || 0);
            }, 0);

            return { nodeIds: path, totalTime };
        }

        openSet.delete(current);

        // Neighbors: Nodes that depend on current OR nodes that current depends on?
        // Study path usually goes from Prerequisite -> Advanced
        // So we follow outgoing edges (where current is source)
        // Wait, dependencies are stored as "target depends on source".
        // So if A is prereq for B, edge is source: A, target: B.
        // If we want to study A then B, we follow the edge.

        const neighbors = edges.filter(e => e.source === current).map(e => e.target);

        for (const neighbor of neighbors) {
            const neighborNode = nodes.find(n => n.id === neighbor);
            if (!neighborNode) continue;

            // Cost is time to learn neighbor
            const tentativeGScore = (gScore.get(current) || Infinity) + (neighborNode.estimatedTime || 60);

            if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + h(neighbor));
                if (!openSet.has(neighbor)) {
                    openSet.add(neighbor);
                }
            }
        }
    }

    return null;
};
