import { ApiResponse, Board } from "../types/board";
import axios from "axios";

const apiurl = import.meta.env.VITE_BACK_URL;

// Mock data for boards
let boards: Board[] = [
  {
    id: "1",
    title: "Project Alpha",
    color: "bg-purple-500",
  },
  {
    id: "2",
    title: "Marketing Campaign",
    color: "bg-blue-500",
  },
  {
    id: "3",
    title: "Website Redesign",
    color: "bg-indigo-500",
  },
  {
    id: "4",
    title: "Personal Tasks",
    color: "bg-pink-500",
  },
];

// Simulating API calls with a delay
const mockApiCall = <T>(data: T, delay = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const fetchBoards = async () => {
  try {
    const response = await axios.get(`${apiurl}/api/v1/board`, {
      withCredentials: true,
    });
    // console.log(response);

    return response.data;
  } catch (error) {
    console.error("Error fetching boards:", error);
    throw error;
  }
};

export const createBoard = async (
  title: string
): Promise<ApiResponse<Board>> => {
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-green-500",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const response = await axios.post<ApiResponse<Board>>(
    `${apiurl}/api/v1/board/create`,
    { title, color: randomColor },
    { withCredentials: true }
  );

  return response.data; // full response
};

export const updateBoard = async (
  id: string,
  title: string
): Promise<Board> => {
  try {
    const response = await axios.put<ApiResponse<Board>>(
      `${apiurl}/api/v1/board/${id}`,
      { title },
      {
        withCredentials: true, // ensures cookies are sent if auth is cookie-based
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data; // return the updated board
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update the board"
    );
  }
};
export const deleteBoard = async (id: string): Promise<string> => {
  try {
    const response = await axios.delete(`${apiurl}/api/v1/board/${id}`, {
      withCredentials: true, // send cookies if required (for auth)
    });

    return response.data.message || "Board deleted successfully";
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete the board"
    );
  }
};
export const updateBoardPositions = async (
  positions: { id: string; position: number }[]
): Promise<any> => {
  try {
    const response = await axios.patch(`${apiurl}/api/v1/board/positions`, {
      positions,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update board positions"
    );
  }
};

export const reorderBoards = async (
  boardId: string,
  sourceIndex: number,
  destinationIndex: number
): Promise<Board[]> => {
  const reorderedBoards = [...boards];
  const [movedBoard] = reorderedBoards.splice(sourceIndex, 1);
  reorderedBoards.splice(destinationIndex, 0, movedBoard);

  boards = reorderedBoards;
  return mockApiCall(boards);
};
