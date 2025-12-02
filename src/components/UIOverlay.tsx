import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { parseSyllabus } from '../lib/SyllabusParser';
import { calculateOrbits } from '../lib/GraphLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Clock, Layers, HelpCircle, Sparkles, Play, Square, Download, Upload, TrendingUp, Flame, BarChart3 } from 'lucide-react';

const TEMPLATES = {
    'react': `React Basics
Components: React Basics
Props: Components
State: Components
Hooks: State
Effects: Hooks
Context: Effects
Routing: Context`,
    'webdev': `HTML Basics
CSS Basics: HTML Basics
JavaScript: HTML Basics, CSS Basics
DOM Manipulation: JavaScript
Fetch API: JavaScript
Async/Await: Fetch API
Frameworks: Async/Await`,
    'datascience': `Python Basics
NumPy: Python Basics
Pandas: NumPy
Matplotlib: Pandas
Scikit-Learn: Pandas
Deep Learning: Scikit-Learn`
};

export const UIOverlay: React.FC = () => {
    const {
        syllabusText,
        setSyllabusText,
        setNodes,
        setEdges,
        nodes,
        selectedNodeId,
        selectNode,
        linkMode,
        setLinkMode,
        linkSourceId,
        notification,
        setNotification,
        // Learning features
        markComplete,
        markIncomplete,
        addNote,
        addResource,
        removeResource,
        // Timer features
        timerActive,
        timerSeconds,
        timerTargetNodeId,
        startTimer,
        stopTimer,
        tickTimer,
        // Statistics
        getTotalStudyTime,
        getCompletionPercentage,
        getStudyStreak,
        getRecommendedTopics,
        // Import/Export
        exportData,
        importData
    } = useStore();

    const [isOpen, setIsOpen] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [showAddResource, setShowAddResource] = useState(false);

    const handleLaunch = () => {
        try {
            const { nodes: rawNodes, edges } = parseSyllabus(syllabusText);
            if (rawNodes.length === 0) throw new Error("No nodes found in syllabus");
            const orbitNodes = calculateOrbits(rawNodes, edges);
            setNodes(orbitNodes);
            setEdges(edges);
            setIsOpen(false);
            setNotification("🚀 Orbits Initialized!");
        } catch (e) {
            setNotification(`❌ Error: ${(e as Error).message}`);
        }
    };

    const loadTemplate = (template: keyof typeof TEMPLATES) => {
        setSyllabusText(TEMPLATES[template]);
        setNotification(`✨ Loaded ${template.toUpperCase()} template`);
    };

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eduorbit-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setNotification('📥 Data exported successfully!');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    importData(content);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    const recommendedTopics = getRecommendedTopics();

    // Update note text when node changes
    useEffect(() => {
        if (selectedNode) {
            setNoteText(selectedNode.notes || '');
        }
    }, [selectedNode]);

    // Timer tick effect
    useEffect(() => {
        if (timerActive) {
            const interval = setInterval(() => {
                tickTimer();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timerActive, tickTimer]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-6 z-50">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="pointer-events-auto absolute top-6 left-1/2 -translate-x-1/2 bg-orbit-accent text-white px-6 py-3 rounded-full shadow-lg z-50 font-mono text-sm flex items-center gap-2"
                    >
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="pointer-events-auto flex justify-between items-start">
                <div>
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 tracking-tighter drop-shadow-lg filter blur-[0.5px]">
                        EDU<span className="text-white">ORBIT</span>
                    </h1>
                    <p className="text-blue-200/60 text-xs font-mono tracking-[0.2em] mt-2 uppercase">
                        Orbital Knowledge System // V2.0
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end max-w-3xl">
                    {/* Timer Display */}
                    {timerActive && (
                        <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 border border-purple-400/50 text-white px-6 py-2 rounded-full font-mono text-xs tracking-wider backdrop-blur-sm shadow-[0_0_15px_rgba(147,51,234,0.5)] flex items-center gap-2">
                            <Clock size={16} className="animate-pulse" />
                            {formatTime(timerSeconds)}
                        </div>
                    )}

                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="bg-white/5 border border-white/10 text-blue-200 px-6 py-2 rounded-full hover:bg-white/10 transition-all font-mono text-xs tracking-wider backdrop-blur-sm flex items-center gap-2"
                    >
                        <BarChart3 size={16} /> STATS
                    </button>
                    <button
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className="bg-white/5 border border-white/10 text-blue-200 px-6 py-2 rounded-full hover:bg-white/10 transition-all font-mono text-xs tracking-wider backdrop-blur-sm flex items-center gap-2"
                    >
                        <TrendingUp size={16} /> NEXT
                    </button>
                    <button
                        onClick={() => setLinkMode(!linkMode)}
                        className={`border px-6 py-2 rounded-full transition-all font-mono text-xs tracking-wider backdrop-blur-sm ${linkMode ? 'bg-purple-600/80 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-white/5 border-white/10 text-blue-200 hover:bg-white/10'
                            }`}
                    >
                        {linkMode ? (linkSourceId ? 'SELECT TARGET' : 'SELECT SOURCE') : 'LINK NODES'}
                    </button>
                    <button
                        onClick={() => useStore.getState().setPathMode(!useStore.getState().pathMode)}
                        className={`border px-6 py-2 rounded-full transition-all font-mono text-xs tracking-wider backdrop-blur-sm ${useStore.getState().pathMode ? 'bg-pink-600/80 text-white border-pink-500 shadow-[0_0_15px_rgba(219,39,119,0.5)]' : 'bg-white/5 border-white/10 text-blue-200 hover:bg-white/10'
                            }`}
                    >
                        {useStore.getState().pathMode ? (useStore.getState().pathStartId ? 'SELECT END' : 'SELECT START') : 'COMPUTE PATH'}
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-white/5 border border-white/10 text-blue-200 px-6 py-2 rounded-full hover:bg-white/10 transition-all font-mono text-xs tracking-wider backdrop-blur-sm flex items-center gap-2"
                    >
                        <Download size={16} /> EXPORT
                    </button>
                    <button
                        onClick={handleImport}
                        className="bg-white/5 border border-white/10 text-blue-200 px-6 py-2 rounded-full hover:bg-white/10 transition-all font-mono text-xs tracking-wider backdrop-blur-sm flex items-center gap-2"
                    >
                        <Upload size={16} /> IMPORT
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-white/5 border border-white/10 text-blue-200 px-6 py-2 rounded-full hover:bg-white/10 transition-all font-mono text-xs tracking-wider backdrop-blur-sm"
                    >
                        {isOpen ? 'CLOSE INPUT' : 'OPEN INPUT'}
                    </button>
                    <button
                        onClick={useStore.getState().reset}
                        className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-2 rounded-full hover:bg-red-500/20 transition-all font-mono text-xs tracking-wider backdrop-blur-sm"
                    >
                        RESET
                    </button>
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-2 rounded-full hover:bg-green-500/20 transition-all font-mono text-xs tracking-wider backdrop-blur-sm flex items-center gap-2"
                    >
                        <HelpCircle size={16} /> HELP
                    </button>
                </div>
            </div>

            {/* Input Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="pointer-events-auto absolute top-32 left-8 w-96 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-50 ring-1 ring-white/5"
                    >
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Layers size={20} /> SYLLABUS INPUT
                        </h2>
                        <div className="mb-4">
                            <p className="text-orbit-text/60 text-xs mb-2 flex items-center gap-2">
                                <Sparkles size={14} /> Quick Start Templates
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => loadTemplate('react')}
                                    className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-all"
                                >
                                    React
                                </button>
                                <button
                                    onClick={() => loadTemplate('webdev')}
                                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded text-xs hover:bg-purple-500/30 transition-all"
                                >
                                    Web Dev
                                </button>
                                <button
                                    onClick={() => loadTemplate('datascience')}
                                    className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-300 rounded text-xs hover:bg-green-500/30 transition-all"
                                >
                                    Data Science
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={syllabusText}
                            onChange={(e) => setSyllabusText(e.target.value)}
                            placeholder="Paste syllabus here...&#10;Topic A&#10;Topic B: Topic A"
                            className="w-full h-64 bg-black/50 border border-white/10 rounded p-3 text-sm font-mono text-orbit-text focus:outline-none focus:border-orbit-planet resize-none"
                        />
                        <button
                            onClick={handleLaunch}
                            className="w-full mt-4 bg-orbit-planet text-white font-bold py-3 rounded flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20"
                        >
                            <Rocket size={18} /> INITIALIZE ORBITS
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Telemetry Panel (Right Side) */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="pointer-events-auto absolute top-32 right-8 w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl ring-1 ring-white/5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-white">{selectedNode.name}</h2>
                            <button onClick={() => selectNode(null)} className="text-white/50 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 font-mono text-sm">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-orbit-text/60">STATUS</span>
                                <span className={`font-bold ${selectedNode.status === 'COMPLETED' ? 'text-green-400' :
                                    selectedNode.status === 'LOCKED' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                    {selectedNode.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-orbit-text/60 flex items-center gap-2"><Clock size={14} /> EST. TIME</span>
                                <span className="text-white">{selectedNode.estimatedTime} MIN</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-orbit-text/60 flex items-center gap-2"><Layers size={14} /> DEPTH</span>
                                <span className="text-white">LEVEL {selectedNode.depth}</span>
                            </div>

                            <div className="mt-4">
                                <div className="text-orbit-text/60 mb-1 text-xs">DEPENDENCIES</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedNode.dependencies.length > 0 ? (
                                        selectedNode.dependencies.map(depId => {
                                            const dep = nodes.find(n => n.id === depId);
                                            return (
                                                <span key={depId} className="px-2 py-1 bg-white/5 rounded text-xs text-orbit-text">
                                                    {dep?.name || depId.slice(0, 8)}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-white/30 text-xs">NONE</span>
                                    )}
                                </div>
                            </div>

                            {/* Complete/Incomplete Button */}
                            <div className="mt-6 pt-4 border-t border-white/10">
                                {selectedNode.status === 'COMPLETED' ? (
                                    <button
                                        onClick={() => markIncomplete(selectedNode.id)}
                                        className="w-full bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all font-mono text-xs flex items-center justify-center gap-2"
                                    >
                                        ✓ COMPLETED - Click to Undo
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => markComplete(selectedNode.id)}
                                        className="w-full bg-blue-500/20 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all font-mono text-xs flex items-center justify-center gap-2"
                                    >
                                        MARK AS COMPLETE
                                    </button>
                                )}
                            </div>

                            {/* Timer Controls */}
                            <div className="mt-4">
                                <div className="text-orbit-text/60 mb-2 text-xs flex items-center gap-2">
                                    <Clock size={14} /> STUDY SESSION
                                </div>
                                {timerActive && timerTargetNodeId === selectedNode.id ? (
                                    <div className="space-y-2">
                                        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-mono font-bold text-white">
                                                {formatTime(timerSeconds)}
                                            </div>
                                            <div className="text-xs text-purple-300 mt-1">Session in progress</div>
                                        </div>
                                        <button
                                            onClick={stopTimer}
                                            className="w-full bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all font-mono text-xs flex items-center justify-center gap-2"
                                        >
                                            <Square size={14} fill="currentColor" /> STOP & SAVE
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => startTimer(selectedNode.id)}
                                        className="w-full bg-purple-500/20 border border-purple-500/50 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-all font-mono text-xs flex items-center justify-center gap-2"
                                        disabled={timerActive}
                                    >
                                        <Play size={14} fill="currentColor" /> START STUDY SESSION
                                    </button>
                                )}
                                {selectedNode.studyTime && selectedNode.studyTime > 0 && (
                                    <div className="text-xs text-orbit-text/50 mt-2 text-center">
                                        Total time studied: {selectedNode.studyTime} minutes
                                    </div>
                                )}
                            </div>

                            {/* Notes Section */}
                            <div className="mt-4">
                                <div className="text-orbit-text/60 mb-2 text-xs flex items-center gap-2">
                                    📝 NOTES
                                </div>
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    onBlur={() => addNote(selectedNode.id, noteText)}
                                    placeholder="Add your study notes here..."
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs resize-none focus:outline-none focus:border-blue-500/50"
                                />
                            </div>

                            {/* Resources Section */}
                            <div className="mt-4">
                                <div className="text-orbit-text/60 mb-2 text-xs flex items-center justify-between">
                                    <span>🔗 RESOURCES</span>
                                    <button
                                        onClick={() => setShowAddResource(!showAddResource)}
                                        className="text-blue-400 hover:text-blue-300 text-xs"
                                    >
                                        + Add
                                    </button>
                                </div>

                                {showAddResource && (
                                    <div className="mb-2 space-y-2 p-2 bg-white/5 rounded">
                                        <input
                                            type="text"
                                            value={resourceTitle}
                                            onChange={(e) => setResourceTitle(e.target.value)}
                                            placeholder="Resource title"
                                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500/50"
                                        />
                                        <input
                                            type="url"
                                            value={resourceUrl}
                                            onChange={(e) => setResourceUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500/50"
                                        />
                                        <button
                                            onClick={() => {
                                                if (resourceUrl && resourceTitle) {
                                                    addResource(selectedNode.id, resourceUrl, resourceTitle);
                                                    setResourceUrl('');
                                                    setResourceTitle('');
                                                    setShowAddResource(false);
                                                }
                                            }}
                                            className="w-full bg-blue-500/20 border border-blue-500/50 text-blue-400 px-2 py-1 rounded text-xs hover:bg-blue-500/30"
                                        >
                                            Save Resource
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    {selectedNode.resources && selectedNode.resources.length > 0 ? (
                                        selectedNode.resources.map((resource, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white/5 px-2 py-1 rounded text-xs group">
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 truncate flex-1"
                                                >
                                                    {resource.title}
                                                </a>
                                                <button
                                                    onClick={() => removeResource(selectedNode.id, resource.url)}
                                                    className="text-red-400/0 group-hover:text-red-400 hover:text-red-300 ml-2"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-white/30 text-xs">No resources yet</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Node List Panel - Left Side */}
            {nodes.length > 0 && (
                <div className="pointer-events-auto absolute left-8 top-32 w-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/5 max-h-[60vh] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Layers size={16} />
                            TOPICS ({nodes.filter(n => n.status === 'COMPLETED').length}/{nodes.length})
                        </h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {nodes.sort((a, b) => a.depth - b.depth).map(node => (
                            <button
                                key={node.id}
                                onClick={() => selectNode(node.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-mono flex items-center gap-2 group ${selectedNodeId === node.id
                                    ? 'bg-blue-500/30 border border-blue-500/50 text-white'
                                    : 'bg-white/5 hover:bg-white/10 text-orbit-text border border-transparent'
                                    }`}
                            >
                                {/* Status Icon */}
                                <span className="text-base">
                                    {node.status === 'COMPLETED' ? '✓' :
                                        node.status === 'LOCKED' ? '🔒' : '○'}
                                </span>

                                {/* Node Name */}
                                <span className={`flex-1 truncate ${node.status === 'COMPLETED' ? 'line-through text-green-400' : ''
                                    }`}>
                                    {node.name}
                                </span>

                                {/* Depth Badge */}
                                <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/50">
                                    L{node.depth}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Help Panel */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl z-50 ring-1 ring-white/10"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <HelpCircle size={24} className="text-green-400" />
                                How to Use EduOrbit
                            </h2>
                            <button onClick={() => setShowHelp(false)} className="text-white/50 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6 text-orbit-text">
                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                                    Create Your Syllabus
                                </h3>
                                <p className="text-sm text-orbit-text/80 ml-8">
                                    Use templates or write your own. Format: <code className="bg-white/10 px-2 py-1 rounded">Topic Name: Dependency1, Dependency2</code>
                                </p>
                            </div>

                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                                    Initialize Orbits
                                </h3>
                                <p className="text-sm text-orbit-text/80 ml-8">
                                    Click "INITIALIZE ORBITS" to generate the 3D graph. Nodes will orbit the center based on their dependencies.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                                    Interact with the Graph
                                </h3>
                                <ul className="text-sm text-orbit-text/80 ml-8 space-y-1">
                                    <li>• <strong>Click a node</strong> to view details</li>
                                    <li>• <strong>Click "LINK NODES"</strong> to connect topics (select source, then target)</li>
                                    <li>• <strong>Click "COMPUTE PATH"</strong> to find optimal study path (select start, then end)</li>
                                    <li>• <strong>Drag</strong> to rotate, <strong>scroll</strong> to zoom</li>
                                </ul>
                            </div>

                            <div className="border-t border-white/10 pt-4 mt-4">
                                <p className="text-xs text-orbit-text/60">
                                    💡 Tip: The further out a node orbits, the more dependencies it has!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Statistics Dashboard */}
            <AnimatePresence>
                {showStats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="pointer-events-auto absolute bottom-8 left-8 w-96 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ring-1 ring-white/5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-blue-400" />
                                Study Statistics
                            </h2>
                            <button onClick={() => setShowStats(false)} className="text-white/50 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Completion Progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-orbit-text/60 font-mono">COMPLETION</span>
                                    <span className="text-white font-bold">{getCompletionPercentage()}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500 rounded-full"
                                        style={{ width: `${getCompletionPercentage()}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-orbit-text/60 text-xs font-mono mb-1">TOTAL TOPICS</div>
                                    <div className="text-2xl font-bold text-white">{nodes.length}</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-orbit-text/60 text-xs font-mono mb-1">COMPLETED</div>
                                    <div className="text-2xl font-bold text-green-400">
                                        {nodes.filter(n => n.status === 'COMPLETED').length}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-orbit-text/60 text-xs font-mono mb-1 flex items-center gap-1">
                                        <Clock size={12} /> TOTAL TIME
                                    </div>
                                    <div className="text-2xl font-bold text-blue-400">{getTotalStudyTime()}m</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-orbit-text/60 text-xs font-mono mb-1 flex items-center gap-1">
                                        <Flame size={12} /> STREAK
                                    </div>
                                    <div className="text-2xl font-bold text-orange-400">{getStudyStreak()}d</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recommendations Panel */}
            <AnimatePresence>
                {showRecommendations && recommendedTopics.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="pointer-events-auto absolute bottom-8 left-8 w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ring-1 ring-white/5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp size={20} className="text-green-400" />
                                Recommended Next
                            </h2>
                            <button onClick={() => setShowRecommendations(false)} className="text-white/50 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {recommendedTopics.slice(0, 5).map((topic, idx) => (
                                <button
                                    key={topic.id}
                                    onClick={() => {
                                        selectNode(topic.id);
                                        setShowRecommendations(false);
                                    }}
                                    className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-400/50 rounded-lg transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="bg-green-500/20 text-green-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-green-500/50">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div className="text-white font-mono text-sm group-hover:text-green-400 transition-colors">
                                                {topic.name}
                                            </div>
                                            <div className="text-orbit-text/50 text-xs mt-1">
                                                Level {topic.depth} • {topic.estimatedTime || 30}min
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
