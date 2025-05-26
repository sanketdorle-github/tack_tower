import axios from "axios";
import { Column, Task } from "../types/board";

// Mock data for columns and tasks
let columnsMap: Record<string, Column[]> = {};
const apiurl = import.meta.env.VITE_BACK_URL; // Replace with your actual API URL

export const fetchBoardColumns = async (boardId: string): Promise<Column[]> => {
  try {
    const response = await axios.get(`${apiurl}/api/v1/list/${boardId}`, {
      withCredentials: true,
    });

    // Transform the API response to match our Column type
    if (response.data?.data) {
      return response.data.data.map((list: any) => ({
        id: list._id,
        title: list.title,
        position: list.position,
        tasks: (list.cards || []).map((card: any) => ({
          id: card._id,
          title: card.title,
          description: card.description || "",
          columnId: card.listId,
          position: card.position,
          dueDate: card.dueDate,
          labels: card.labels,
          assignedTo: card.assignedTo,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
        })),
      }));
    }

    return [];
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch board columns"
    );
  }
};

export const createColumn = async (
  title: string,
  boardId: string
): Promise<Column> => {
  try {
    const response = await axios.post(
      `${apiurl}/api/v1/list/${boardId}`,
      { title },
      { withCredentials: true }
    );

    console.log("response in create newColumn ", response);
    const newColumn = response.data.data;
    return {
      id: newColumn._id,
      title: newColumn.title,
      position: newColumn.position,
      tasks: [],
    };
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to create column"
    );
  }
};

export const updateColumn = async (
  columnId: string,
  title: string
): Promise<Column> => {
  try {
    const response = await axios.put(
      `${apiurl}/api/v1/list/${columnId}`,
      { title },
      { withCredentials: true }
    );

    const updatedColumn = response.data.data;
    return {
      id: updatedColumn._id,
      title: updatedColumn.title,
      position: updatedColumn.position,
      tasks: [],
    };
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update column"
    );
  }
};

export const deleteColumn = async (columnId: string): Promise<string> => {
  try {
    const response = await axios.delete(`${apiurl}/api/v1/list/${columnId}`, {
      withCredentials: true,
    });

    return response.data.message || "Column deleted successfully";
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete column"
    );
  }
};

export const createTask = async (
  columnId: string,
  title: string,
  description: string
): Promise<Task> => {
  try {
    const response = await axios.post(
      `${apiurl}/api/v1/card/${columnId}`,
      { title, description },
      { withCredentials: true }
    );

    const newTask = response.data.data;
    return {
      id: newTask._id,
      title: newTask.title,
      description: newTask.description || "",
      columnId: newTask.listId,
      position: newTask.position,
      dueDate: newTask.dueDate,
      labels: newTask.labels,
      assignedTo: newTask.assignedTo,
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create task");
  }
};

export const updateTask = async (
  taskId: string,
  columnId: string,
  title: string,
  description: string
): Promise<Task> => {
  try {
    const response = await axios.put(
      `${apiurl}/api/v1/card/update/${taskId}`,
      { title, description },
      { withCredentials: true }
    );

    const updatedTask = response.data.data;
    return {
      id: updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description || "",
      columnId: columnId,
      position: updatedTask.position,
      dueDate: updatedTask.dueDate,
      labels: updatedTask.labels,
      assignedTo: updatedTask.assignedTo,
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update task");
  }
};

export const deleteTask = async (
  taskId: string,
  columnId: string
): Promise<string> => {
  try {
    const response = await axios.delete(
      `${apiurl}/api/v1/card/delete/${taskId}`,
      {
        withCredentials: true,
      }
    );

    return response.data.message || "Task deleted successfully";
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete task");
  }
};

// export const moveTask = async (
//   taskId: string,
//   sourceColumnId: string,
//   destinationColumnId: string,
//   sourceIndex: number,
//   destinationIndex: number
// ): Promise<any> => {
//   try {
//     const response = await axios.patch(
//       `${apiurl}/api/v1/card/move/${taskId}`,
//       {
//         sourceListId: sourceColumnId,
//         targetListId: destinationColumnId,
//         sourcePosition: sourceIndex,
//         targetPosition: destinationIndex
//       },
//       { withCredentials: true }
//     );

//     return response.data;
//   } catch (error: any) {
//     throw new Error(
//       error?.response?.data?.message || "Failed to move task"
//     );
//   }
// };

export const moveTask = async (
  taskId: string,
  sourceListId: string,
  destinationListId: string,
  sourceCardOrder: string[],
  destinationCardOrder: string[]
): Promise<any> => {
  try {
    console.log("Moving task with parameters:", {
      taskId,
      sourceListId,
      destinationListId,
      sourceCardOrder,
      destinationCardOrder,
    });

    const response = await axios.put(
      `${apiurl}/api/v1/card/reorder/${taskId}`,
      {
        sourceListId,
        destinationListId,
        sourceCardOrder,
        destinationCardOrder,
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error moving task:", error);
    throw new Error(error?.response?.data?.message || "Failed to move task");
  }
};
export const moveColumn = async (
  columnId: string,
  sourceIndex: number,
  destinationIndex: number
): Promise<any> => {
  try {
    const response = await axios.patch(
      `${apiurl}/api/v1/list/move/${columnId}`,
      {
        sourcePosition: sourceIndex,
        targetPosition: destinationIndex,
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to move column");
  }
};
