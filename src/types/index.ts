export interface TopicNode {
  id: string;
  name: string;
  status: 'ORBIT' | 'COMPLETED' | 'LOCKED';
  depth: number;
  dependencies: string[];
  position?: [number, number, number];
  estimatedTime?: number;
  // Learning features
  notes?: string;
  resources?: { url: string; title: string; }[];
  studyTime?: number; // minutes spent
  completedDate?: string;
}

export interface DependencyEdge {
  source: string; // Prerequisite
  target: string; // Dependent
}

export interface StudyPath {
  nodeIds: string[];
  totalTime: number;
}
