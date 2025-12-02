import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Environment, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from '../store/store';
import { computePath } from '../lib/GraphLogic';
import type { TopicNode } from '../types';

const Planet = () => {
    return (
        <group>
            {/* Core Planet */}
            <mesh>
                <sphereGeometry args={[4, 64, 64]} />
                <meshStandardMaterial
                    color="#2563eb"
                    emissive="#1d4ed8"
                    emissiveIntensity={2}
                    roughness={0.3}
                    metalness={0.8}
                />
            </mesh>
            {/* Atmosphere Glow */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[4, 64, 64]} />
                <meshBasicMaterial
                    color="#60a5fa"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </mesh>
            <pointLight intensity={5} distance={100} decay={2} color="#60a5fa" />
        </group>
    );
};

const PathVisualizer = () => {
    const { nodes, currentPath } = useStore();

    const points = useMemo(() => {
        if (!currentPath || !currentPath.nodeIds) return [];
        return currentPath.nodeIds.map(id => {
            const node = nodes.find(n => n.id === id);
            return node?.position ? new THREE.Vector3(...node.position) : new THREE.Vector3();
        });
    }, [currentPath, nodes]);

    if (points.length < 2) return null;

    return (
        <Line
            points={points}
            color="#f43f5e"
            lineWidth={3}
            dashed={false}
        />
    );
};

const DependencyLines = () => {
    const { nodes, edges } = useStore();
    const linesRef = useRef<THREE.Group>(null);

    // Create line geometries for each edge
    const edgeData = useMemo(() => {
        return edges.map(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;

            const sourceIndex = nodes.indexOf(source);
            const targetIndex = nodes.indexOf(target);

            return {
                id: `${edge.source}-${edge.target}`,
                sourceIndex,
                targetIndex,
                source,
                target
            };
        }).filter(Boolean);
    }, [nodes, edges]);

    return (
        <group ref={linesRef}>
            {edgeData.map((edge) => {
                if (!edge) return null;
                return (
                    <AnimatedLine
                        key={edge.id}
                        sourceNode={edge.source}
                        targetNode={edge.target}
                        sourceIndex={edge.sourceIndex}
                        targetIndex={edge.targetIndex}
                    />
                );
            })}
        </group>
    );
};

const AnimatedLine: React.FC<{
    sourceNode: TopicNode;
    targetNode: TopicNode;
    sourceIndex: number;
    targetIndex: number;
}> = ({ sourceNode, targetNode, sourceIndex, targetIndex }) => {
    const lineRef = useRef<THREE.Line>(null);
    const { clock } = useThree();

    useFrame(() => {
        if (!lineRef.current || !sourceNode.position || !targetNode.position) return;

        const time = clock.getElapsedTime();

        // Calculate source position (same logic as in Satellites)
        const sourceRadius = Math.sqrt(sourceNode.position[0] ** 2 + sourceNode.position[2] ** 2);
        const sourceSpeed = 0.5 / (sourceNode.depth + 1);
        const sourceAngle = time * sourceSpeed + (sourceIndex * 0.1);
        const sourceX = Math.cos(sourceAngle) * sourceRadius;
        const sourceZ = Math.sin(sourceAngle) * sourceRadius;
        const sourceY = sourceNode.position[1];

        // Calculate target position
        const targetRadius = Math.sqrt(targetNode.position[0] ** 2 + targetNode.position[2] ** 2);
        const targetSpeed = 0.5 / (targetNode.depth + 1);
        const targetAngle = time * targetSpeed + (targetIndex * 0.1);
        const targetX = Math.cos(targetAngle) * targetRadius;
        const targetZ = Math.sin(targetAngle) * targetRadius;
        const targetY = targetNode.position[1];

        // Update line positions
        const positions = lineRef.current.geometry.attributes.position;
        positions.setXYZ(0, sourceX, sourceY, sourceZ);
        positions.setXYZ(1, targetX, targetY, targetZ);
        positions.needsUpdate = true;
    });

    return (
        <>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <line ref={lineRef as any}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        args={[new Float32Array(6), 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#60a5fa" opacity={0.3} transparent />
            </line>
        </>
    );
};

const NodeLabels = () => {
    const { nodes } = useStore();
    const { clock } = useThree();

    return (
        <>
            {nodes.map((node, i) => {
                if (!node.position) return null;

                const { depth, position } = node;
                const radius = Math.sqrt(position[0] ** 2 + position[2] ** 2);
                const speed = 0.5 / (depth + 1);
                const time = clock.getElapsedTime();
                const angle = time * speed + (i * 0.1);

                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = position[1] + 1.5; // Above the node

                return (
                    <Text
                        key={node.id}
                        position={[x, y, z]}
                        fontSize={0.4}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.05}
                        outlineColor="#000000"
                    >
                        {node.name}
                    </Text>
                );
            })}
        </>
    );
};

const LinkingLine = () => {
    const { linkMode, linkSourceId, nodes } = useStore();
    const { raycaster, camera, pointer } = useThree();
    const ref = useRef<THREE.Line>(null);

    const sourceNode = useMemo(() => nodes.find(n => n.id === linkSourceId), [nodes, linkSourceId]);

    useFrame(() => {
        if (!ref.current) return;

        if (!linkMode || !linkSourceId || !sourceNode || !sourceNode.position) {
            ref.current.visible = false;
            return;
        }
        ref.current.visible = true;

        raycaster.setFromCamera(pointer, camera);
        const end = new THREE.Vector3();
        raycaster.ray.at(30, end); // Fixed distance for visual feedback

        const positions = ref.current.geometry.attributes.position;
        positions.setXYZ(0, sourceNode.position[0], sourceNode.position[1], sourceNode.position[2]);
        positions.setXYZ(1, end.x, end.y, end.z);
        positions.needsUpdate = true;
    });

    return (
        <>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <line ref={ref as any}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        args={[new Float32Array(6), 3]}
                    />
                </bufferGeometry>
                <lineDashedMaterial color="white" dashSize={1} gapSize={0.5} />
            </line>
        </>
    );
};

const Satellites = () => {
    const {
        nodes, edges, selectNode, selectedNodeId,
        linkMode, linkSourceId, setLinkSource, addEdge,
        pathMode, pathStartId, setPathStart, setPath, setPathMode,
        setNotification
    } = useStore();

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    // Update instances
    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        const time = clock.getElapsedTime();

        nodes.forEach((node, i) => {
            const { depth, position } = node;
            if (!position) return;

            // Orbit logic
            const radius = Math.sqrt(position[0] ** 2 + position[2] ** 2);
            const speed = 0.5 / (depth + 1);
            const angle = time * speed + (i * 0.1);

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = position[1];

            dummy.position.set(x, y, z);
            dummy.scale.setScalar(node.id === selectedNodeId || node.id === pathStartId ? 1.5 : 1);
            dummy.rotation.y = -angle;
            dummy.updateMatrix();

            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // Color logic
            if (linkMode && linkSourceId === node.id) {
                color.set('#ffffff'); // Source selected for linking
            } else if (pathMode && pathStartId === node.id) {
                color.set('#ffffff'); // Start selected for path
            } else if (node.status === 'COMPLETED') {
                color.set('#4ade80');
            } else if (node.status === 'LOCKED') {
                color.set('#f43f5e');
            } else if (node.status === 'ORBIT') {
                color.set('#60a5fa');
            } else {
                color.set('#fbbf24');
            }

            meshRef.current!.setColorAt(i, color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        const instanceId = e.instanceId;
        if (instanceId !== undefined && nodes[instanceId]) {
            const clickedNodeId = nodes[instanceId].id;

            if (linkMode) {
                if (!linkSourceId) {
                    setLinkSource(clickedNodeId);
                } else {
                    if (linkSourceId !== clickedNodeId) {
                        addEdge(linkSourceId, clickedNodeId);
                        setNotification(`Linked ${nodes.find(n => n.id === linkSourceId)?.name} to ${nodes.find(n => n.id === clickedNodeId)?.name}`);
                        setLinkSource(null); // Reset after linking
                    }
                }
            } else if (pathMode) {
                if (!pathStartId) {
                    setPathStart(clickedNodeId);
                } else {
                    if (pathStartId !== clickedNodeId) {
                        const path = computePath(nodes, edges, pathStartId, clickedNodeId);
                        setPath(path);
                        setPathStart(null);
                        setPathMode(false);
                    }
                }
            } else {
                selectNode(clickedNodeId);
            }
        }
    };

    return (
        <instancedMesh
            key={nodes.length}
            ref={meshRef}
            args={[undefined, undefined, nodes.length]}
            onClick={handleClick}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshPhysicalMaterial
                roughness={0.2}
                metalness={0.8}
                clearcoat={1}
                clearcoatRoughness={0.1}
            />
        </instancedMesh>
    );
};

const OrbitLines = () => {
    const { nodes } = useStore();
    const depths = useMemo(() => [...new Set(nodes.map(n => n.depth))], [nodes]);

    return (
        <>
            {depths.map(depth => {
                const radius = 15 + depth * 8;
                return (
                    <mesh key={depth} rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[radius - 0.1, radius + 0.1, 64]} />
                        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
                    </mesh>
                );
            })}
        </>
    );
};

export const OrbitEngine: React.FC = () => {
    return (
        <div className="w-full h-full absolute top-0 left-0">
            <Canvas camera={{ position: [0, 40, 60], fov: 45 }}>
                <color attach="background" args={['#0a0a0f']} />
                <ambientLight intensity={0.2} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Planet />
                <Satellites />
                <DependencyLines />
                <NodeLabels />
                <PathVisualizer />
                <LinkingLine />
                <OrbitLines />
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                <Environment preset="city" />
                <EffectComposer>
                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};
