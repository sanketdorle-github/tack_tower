
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Column, Task } from '../../types/board';

interface TasksState {
  columns: Column[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  columns: [],
  loading: false,
  error: null,
};

// Simulating API calls with a delay
const mockApiCall = <T>(data: T, delay = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// Async thunk actions
export const fetchBoardColumns = createAsyncThunk(
  'tasks/fetchBoardColumns',
  async (boardId: string) => {
    // Mock data for columns and tasks
    const mockColumns: Column[] = [
      {
        id: "column1",
        title: "To Do",
        boardId,
        tasks: [
          { id: "task1", columnId: "column1", title: "Research competitors", description: "Look at similar products and identify strengths and weaknesses" },
          { id: "task2", columnId: "column1", title: "Create wireframes", description: "Design preliminary wireframes for key screens" },
          { id: "task3", columnId: "column1", title: "Setup development environment" }
        ]
      },
      {
        id: "column2",
        title: "In Progress",
        boardId,
        tasks: [
          { id: "task4", columnId: "column2", title: "Implement authentication", description: "Create login and registration flows" },
          { id: "task5", columnId: "column2", title: "Build dashboard UI" }
        ]
      },
      {
        id: "column3",
        title: "Review",
        boardId,
        tasks: [
          { id: "task6", columnId: "column3", title: "Code review: API endpoints", description: "Review and optimize API endpoints" }
        ]
      },
      {
        id: "column4",
        title: "Done",
        boardId,
        tasks: [
          { id: "task7", columnId: "column4", title: "Setup project repo", description: "Initialize repository and configure CI/CD" },
          { id: "task8", columnId: "column4", title: "Create project plan" }
        ]
      }
    ];
    
    return mockApiCall(mockColumns, 1000);
  }
);

export const createColumn = createAsyncThunk(
  'tasks/createColumn',
  async ({ title, boardId }: { title: string, boardId: string }) => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title,
      boardId,
      tasks: [],
    };
    
    return mockApiCall(newColumn);
  }
);

export const updateColumn = createAsyncThunk(
  'tasks/updateColumn',
  async ({ id, title }: { id: string, title: string }) => {
    return mockApiCall({ id, title });
  }
);

export const deleteColumn = createAsyncThunk(
  'tasks/deleteColumn',
  async (id: string) => {
    await mockApiCall(null, 500);
    return id;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ columnId, title, description }: { columnId: string, title: string, description: string }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      columnId,
      title,
      description,
    };
    
    return mockApiCall(newTask);
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, columnId, title, description }: { id: string, columnId: string, title: string, description: string }) => {
    return mockApiCall({ id, columnId, title, description });
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ id, columnId }: { id: string, columnId: string }) => {
    await mockApiCall(null, 500);
    return { id, columnId };
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ 
    taskId, 
    sourceColumnId, 
    destColumnId, 
    sourceIndex, 
    destIndex 
  }: { 
    taskId: string, 
    sourceColumnId: string, 
    destColumnId: string, 
    sourceIndex: number, 
    destIndex: number 
  }) => {
    // This would be an API call in a real application
    return mockApiCall({ 
      taskId, 
      sourceColumnId, 
      destColumnId, 
      sourceIndex, 
      destIndex 
    });
  }
);

// Add new action for moving columns
export const moveColumn = createAsyncThunk(
  'tasks/moveColumn',
  async ({ 
    columnId, 
    sourceIndex, 
    destIndex 
  }: { 
    columnId: string, 
    sourceIndex: number, 
    destIndex: number 
  }) => {
    // This would be an API call in a real application
    return mockApiCall({ 
      columnId,
      sourceIndex, 
      destIndex 
    });
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch columns
      .addCase(fetchBoardColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardColumns.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = action.payload;
      })
      .addCase(fetchBoardColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board data';
      })
      
      // Create column
      .addCase(createColumn.fulfilled, (state, action) => {
        state.columns.push(action.payload);
      })
      
      // Update column
      .addCase(updateColumn.fulfilled, (state, action) => {
        const { id, title } = action.payload;
        const column = state.columns.find(c => c.id === id);
        if (column) {
          column.title = title;
        }
      })
      
      // Delete column
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter(column => column.id !== action.payload);
      })
      
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        const { columnId } = action.payload;
        const column = state.columns.find(c => c.id === columnId);
        if (column) {
          column.tasks.push(action.payload);
        }
      })
      
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id, columnId, title, description } = action.payload;
        const column = state.columns.find(c => c.id === columnId);
        if (column) {
          const task = column.tasks.find(t => t.id === id);
          if (task) {
            task.title = title;
            task.description = description;
          }
        }
      })
      
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { id, columnId } = action.payload;
        const column = state.columns.find(c => c.id === columnId);
        if (column) {
          column.tasks = column.tasks.filter(t => t.id !== id);
        }
      })
      
      // Move task
      .addCase(moveTask.fulfilled, (state, action) => {
        const { taskId, sourceColumnId, destColumnId, sourceIndex, destIndex } = action.payload;
        
        // If in the same column
        if (sourceColumnId === destColumnId) {
          const column = state.columns.find(c => c.id === sourceColumnId);
          if (column) {
            const [movedTask] = column.tasks.splice(sourceIndex, 1);
            column.tasks.splice(destIndex, 0, movedTask);
          }
        } else {
          // Moving between different columns
          const sourceColumn = state.columns.find(c => c.id === sourceColumnId);
          const destColumn = state.columns.find(c => c.id === destColumnId);
          
          if (sourceColumn && destColumn) {
            const [movedTask] = sourceColumn.tasks.splice(sourceIndex, 1);
            movedTask.columnId = destColumnId;
            destColumn.tasks.splice(destIndex, 0, movedTask);
          }
        }
      })
      
      // Add handler for column reordering
      .addCase(moveColumn.fulfilled, (state, action) => {
        const { columnId, sourceIndex, destIndex } = action.payload;
        
        // Reorder columns array
        const [movedColumn] = state.columns.splice(sourceIndex, 1);
        state.columns.splice(destIndex, 0, movedColumn);
      });
  },
});

export default tasksSlice.reducer;
