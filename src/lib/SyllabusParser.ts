import type { TopicNode, DependencyEdge } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const parseSyllabus = (text: string): { nodes: TopicNode[], edges: DependencyEdge[] } => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const nodes: TopicNode[] = [];
    const edges: DependencyEdge[] = [];
    const nodeMap = new Map<string, string>(); // Name -> ID

    // First pass: Create nodes
    lines.forEach(line => {
        const parts = line.split(':');
        const name = parts[0].trim();
        if (!nodeMap.has(name)) {
            const id = uuidv4();
            nodeMap.set(name, id);

            nodes.push({
                id,
                name,
                dependencies: [],
                estimatedTime: 30, // Default 30 mins
                status: 'LOCKED',
                depth: 0,
                position: [0, 0, 0]
            });
        }
    });

    // Second pass: Link dependencies (if specified in text, e.g., "Topic B: Topic A")
    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length > 1) {
            const name = parts[0].trim();
            const deps = parts[1].split(',').map(d => d.trim());
            const targetId = nodeMap.get(name);

            if (targetId) {
                deps.forEach(depName => {
                    const sourceId = nodeMap.get(depName);
                    if (sourceId) {
                        edges.push({ source: sourceId, target: targetId });
                        const node = nodes.find(n => n.id === targetId);
                        if (node && !node.dependencies.includes(sourceId)) {
                            node.dependencies.push(sourceId);
                        }
                    }
                });
            }
        }
    });

    return { nodes, edges };
};
