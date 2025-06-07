// export interface List {
//   // Example structure
//   _id: string;
//   // title: string;
//   // tasks: string[]; // or a `Task[]` interface
// }

// export interface BoardFR {
//   _id: string;
//   title: string;
//   createdBy: string;
//   members: string[];
//   lists: List[];
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
//   color?: string;
// }
// export interface Board {
//   id: string;
//   title: string;

//   color?: string;
// }

// export interface Column {
//   id: string;
//   title: string;
//   boardId: string;
//   tasks: Task[];
// }

// export interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   columnId: string;
// }

// export interface ApiResponse<T> {
//   statusCode: number;
//   data: T;
//   message: string;
//   success: boolean;
// }

export interface Board {
  _id: string;
  
  title: string;
  description?: string;
  createdBy?: string;
  members?: string[];
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardFR {
  _id: string;
  title: string;
  color?: string;
  createdBy: string;
  members: string[];
  lists: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position?: number;
  dueDate?: string;
  labels?: string[];
  assignedTo?: string[];
  assignedUsers?: User[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  position?: number;
  boardId?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
