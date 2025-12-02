import { create } from 'zustand';
import type { TopicNode, DependencyEdge, StudyPath } from '../types';
import { calculateOrbits } from '../lib/GraphLogic';

interface AppState {
    nodes: TopicNode[];
    edges: DependencyEdge[];
    syllabusText: string;
    currentPath: StudyPath | null;
    selectedNodeId: string | null;
    linkMode: boolean;
    linkSourceId: string | null;
    pathMode: boolean;
    pathStartId: string | null;
    notification: string | null;
    // Timer state
    timerActive: boolean;
    timerSeconds: number;
    timerTargetNodeId: string | null;

    setSyllabusText: (text: string) => void;
    setNodes: (nodes: TopicNode[]) => void;
    setEdges: (edges: DependencyEdge[]) => void;
    addEdge: (source: string, target: string) => void;
    updateNodeStatus: (id: string, status: TopicNode['status']) => void;
    selectNode: (id: string | null) => void;
    setPath: (path: StudyPath | null) => void;
    setLinkMode: (enabled: boolean) => void;
    setLinkSource: (id: string | null) => void;
    setPathMode: (enabled: boolean) => void;
    setPathStart: (id: string | null) => void;
    setNotification: (msg: string | null) => void;
    reset: () => void;
    // Learning features
    markComplete: (nodeId: string) => void;
    markIncomplete: (nodeId: string) => void;
    addNote: (nodeId: string, note: string) => void;
    addResource: (nodeId: string, url: string, title: string) => void;
    removeResource: (nodeId: string, url: string) => void;
    addStudyTime: (nodeId: string, minutes: number) => void;
    saveToLocalStorage: () => void;
    loadFromLocalStorage: () => boolean;
    getRecommendedTopics: () => TopicNode[];
    // Timer functions
    startTimer: (nodeId: string) => void;
    stopTimer: () => void;
    tickTimer: () => void;
    // Statistics functions
    getTotalStudyTime: () => number;
    getCompletionPercentage: () => number;
    getStudyStreak: () => number;
    // Import/Export
    exportData: () => string;
    importData: (jsonString: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
    nodes: [],
    edges: [],
    syllabusText: `React Basics
Components: React Basics
Props: Components
State: Components
Hooks: State
Effects: Hooks
Context: Effects`,
    currentPath: null,
    selectedNodeId: null,
    linkMode: false,
    linkSourceId: null,
    pathMode: false,
    pathStartId: null,
    notification: null,
    // Timer state
    timerActive: false,
    timerSeconds: 0,
    timerTargetNodeId: null,

    setSyllabusText: (text) => set({ syllabusText: text }),
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    addEdge: (source, target) => set((state) => {
        if (state.edges.some(e => e.source === source && e.target === target)) return state;
        const newEdges = [...state.edges, { source, target }];
        const updatedNodesData = state.nodes.map(n => {
            if (n.id === target && !n.dependencies.includes(source)) {
                return { ...n, dependencies: [...n.dependencies, source] };
            }
            return n;
        });
        const newNodes = calculateOrbits(updatedNodesData, newEdges);
        return { edges: newEdges, nodes: newNodes };
    }),

    updateNodeStatus: (id, status) => set((state) => ({
        nodes: state.nodes.map((n) => n.id === id ? { ...n, status } : n)
    })),

    selectNode: (id) => set({ selectedNodeId: id }),
    setPath: (path) => set({ currentPath: path }),
    setLinkMode: (enabled) => set({ linkMode: enabled, linkSourceId: null, pathMode: false }),
    setLinkSource: (id) => set({ linkSourceId: id }),
    setPathMode: (enabled) => set({ pathMode: enabled, pathStartId: null, linkMode: false }),
    setPathStart: (id) => set({ pathStartId: id }),
    setNotification: (msg) => set({ notification: msg }),

    // Learning features
    markComplete: (nodeId) => {
        set((state) => ({
            nodes: state.nodes.map(n =>
                n.id === nodeId
                    ? { ...n, status: 'COMPLETED' as const, completedDate: new Date().toISOString() }
                    : n
            )
        }));
        setTimeout(() => get().saveToLocalStorage(), 0);
    },

    markIncomplete: (nodeId) => {
        set((state) => ({
            nodes: state.nodes.map(n =>
                n.id === nodeId
                    ? { ...n, status: 'ORBIT' as const, completedDate: undefined }
                    : n
            )
        }));
        setTimeout(() => get().saveToLocalStorage(), 0);
    },

    addNote: (nodeId, note) => {
        set((state) => ({
            nodes: state.nodes.map(n => n.id === nodeId ? { ...n, notes: note } : n)
        }));
        setTimeout(() => get().saveToLocalStorage(), 0);
    },

    addResource: (nodeId, url, title) => {
        set((state) => ({
            nodes: state.nodes.map(n => {
                if (n.id === nodeId) {
                    const resources = n.resources || [];
                    return { ...n, resources: [...resources, { url, title }] };
                }
                return n;
            })
        }));
        setTimeout(() => get().saveToLocalStorage(), 0);
    },

    removeResource: (nodeId, url) => {
        set((state) => ({
            nodes: state.nodes.map(n => {
                if (n.id === nodeId && n.resources) {
                    return { ...n, resources: n.resources.filter(r => r.url !== url) };
                }
                return n;
            })
        }));
        setTimeout(() => get().saveToLocalStorage(), 0);
    },

    addStudyTime: (nodeId, minutes) => {
        set((state) => ({
            nodes: state.nodes.map(n =>
                n.id === nodeId
                    ? { ...n, studyTime: (n.studyTime || 0) + minutes }
                    : n
            )
        }));
        setTimeout(() => get().saveToLocalStorage(), 0);
    },

    getRecommendedTopics: () => {
        const { nodes } = get();
        const unlocked = nodes.filter(node => {
            if (node.status === 'COMPLETED') return false;
            const allDepsCompleted = node.dependencies.every(depId => {
                const depNode = nodes.find(n => n.id === depId);
                return depNode?.status === 'COMPLETED';
            });
            return allDepsCompleted;
        });
        return unlocked.sort((a, b) => a.depth - b.depth).slice(0, 5);
    },

    saveToLocalStorage: () => {
        const { nodes, edges, syllabusText } = get();
        const dataToSave = {
            nodes,
            edges,
            syllabusText,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('eduorbit-data', JSON.stringify(dataToSave));
    },

    loadFromLocalStorage: () => {
        const saved = localStorage.getItem('eduorbit-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                set({
                    nodes: data.nodes || [],
                    edges: data.edges || [],
                    syllabusText: data.syllabusText || ''
                });
                return true;
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
                return false;
            }
        }
        return false;
    },

    reset: () => {
        localStorage.removeItem('eduorbit-data');
        set({
            nodes: [],
            edges: [],
            syllabusText: '',
            currentPath: null,
            selectedNodeId: null,
            linkMode: false,
            linkSourceId: null,
            pathMode: false,
            pathStartId: null,
            notification: "System Reset",
            timerActive: false,
            timerSeconds: 0,
            timerTargetNodeId: null
        });
    },

    // Timer functions
    startTimer: (nodeId) => {
        set({ timerActive: true, timerTargetNodeId: nodeId, timerSeconds: 0 });
    },

    stopTimer: () => {
        const { timerSeconds, timerTargetNodeId } = get();
        if (timerTargetNodeId && timerSeconds > 0) {
            const minutes = Math.floor(timerSeconds / 60);
            get().addStudyTime(timerTargetNodeId, minutes);
        }
        set({ timerActive: false, timerSeconds: 0, timerTargetNodeId: null });
    },

    tickTimer: () => {
        const { timerActive, timerSeconds } = get();
        if (timerActive) {
            set({ timerSeconds: timerSeconds + 1 });
        }
    },

    // Statistics functions
    getTotalStudyTime: () => {
        const { nodes } = get();
        return nodes.reduce((total, node) => total + (node.studyTime || 0), 0);
    },

    getCompletionPercentage: () => {
        const { nodes } = get();
        if (nodes.length === 0) return 0;
        const completed = nodes.filter(n => n.status === 'COMPLETED').length;
        return Math.round((completed / nodes.length) * 100);
    },

    getStudyStreak: () => {
        const { nodes } = get();
        const completedNodes = nodes
            .filter(n => n.completedDate)
            .map(n => new Date(n.completedDate!).toDateString())
            .sort();

        if (completedNodes.length === 0) return 0;

        const uniqueDates = [...new Set(completedNodes)];
        let streak = 1;
        let currentStreak = 1;

        for (let i = uniqueDates.length - 1; i > 0; i--) {
            const current = new Date(uniqueDates[i]);
            const previous = new Date(uniqueDates[i - 1]);
            const diffTime = current.getTime() - previous.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                currentStreak++;
                streak = Math.max(streak, currentStreak);
            } else if (diffDays > 1) {
                break;
            }
        }

        return streak;
    },

    // Import/Export functions
    exportData: () => {
        const { nodes, edges, syllabusText } = get();
        const dataToExport = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            nodes,
            edges,
            syllabusText
        };
        return JSON.stringify(dataToExport, null, 2);
    },

    importData: (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (data.nodes && data.edges) {
                set({
                    nodes: data.nodes,
                    edges: data.edges,
                    syllabusText: data.syllabusText || ''
                });
                get().saveToLocalStorage();
                get().setNotification('✅ Data imported successfully!');
            } else {
                get().setNotification('❌ Invalid data format');
            }
        } catch (e) {
            get().setNotification('❌ Failed to import data');
            console.error('Import error:', e);
        }
    }
}));
