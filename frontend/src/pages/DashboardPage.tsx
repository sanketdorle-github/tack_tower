import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/layout/AppHeader";
import BoardCard from "@/components/dashboard/BoardCard";
import CreateBoardDialog from "@/components/dashboard/CreateBoardDialog";
import {
  fetchBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  updateBoardPositions,
  reorderBoards,
} from "@/utils/boardsData";
import { Board, BoardFR } from "@/types/board";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [boards, setBoards] = useState<BoardFR[]>([]);
  const [loading, setLoading] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editBoardId, setEditBoardId] = useState<string | null>(null);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);
  const [boardToEdit, setBoardToEdit] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const data = await fetchBoards();
      // console.log("boards data", data);

      setBoards(data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch boards. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // Fetch boards using our utility function
    loadBoards();
  }, [navigate, toast]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // Fetch boards using our utility function
    loadBoards();
  }, []);

  const handleCreateBoard = async (title: string) => {
    try {
      const response = await createBoard(title); // full API response

      toast({
        title: "Success",
        description: response.message || "Board created successfully!",
      });

      // console.log("new board data", response.data);

      return response.data; // return only the board object
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create board. Please try again.",
      });
    }
  };

  const handleEditBoard = (id: string) => {
    const board = boards.find((b) => b._id === id);
    if (board) {
      setBoardToEdit({ id, title: board.title });
      setEditBoardId(id);
    }
    fetchBoards();
  };

  const handleDeleteBoard = (id: string) => {
    setDeleteBoardId(id);
  };

  const confirmDeleteBoard = async () => {
    if (!deleteBoardId) return;

    try {
      await deleteBoard(deleteBoardId);
      setBoards((prev) => prev.filter((board) => board._id !== deleteBoardId));
      toast({
        title: "Success",
        description: "Board deleted successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete board. Please try again.",
      });
    } finally {
      setDeleteBoardId(null);
    }
  };

  const handleUpdateBoard = async (title: string) => {
    if (!editBoardId) return;

    try {
      const updatedBoard = await updateBoard(editBoardId, title);
      setBoards((prev) =>
        prev.map((board) =>
          board._id === editBoardId
            ? { ...board, title: updatedBoard.title }
            : board
        )
      );
      toast({
        title: "Success",
        description: "Board updated successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update board. Please try again.",
      });
    } finally {
      setEditBoardId(null);
      setBoardToEdit(null);
    }
  };
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area or at the same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }
    console.log("entering inside the try block");

    try {
      // Optimistically update the UI
      const reorderedBoards = [...boards];
      const [movedBoard] = reorderedBoards.splice(source.index, 1);
      reorderedBoards.splice(destination.index, 0, movedBoard);
      setBoards(reorderedBoards);

      // Then send to backend
      reorderBoards(draggableId, source.index, destination.index).catch(
        (error) => {
          // If the backend update fails, revert to original state
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update board position. Reverting changes.",
          });

          // Revert to original state
          const originalBoards = [...boards];
          setBoards(originalBoards);
        }
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update board position. Please try again.",
      });
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader onCreateBoardClick={() => setCreateDialogOpen(true)} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            My Boards
          </h1>
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            <span>Create New Board</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              No boards yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first board to get started
            </p>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Create a Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board._id}
                id={board._id}
                title={board.title}
                color={board.color}
                onEdit={handleEditBoard}
                onDelete={handleDeleteBoard}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Board Dialog */}
      <CreateBoardDialog
        open={createDialogOpen}
        loadBoardsFunc={loadBoards}
        onOpenChange={setCreateDialogOpen}
        onCreateBoard={handleCreateBoard}
      />

      {/* Edit Board Dialog */}
      <CreateBoardDialog
        open={!!editBoardId}
        loadBoardsFunc={loadBoards}
        onOpenChange={(open) => {
          if (!open) {
            setEditBoardId(null);
            setBoardToEdit(null);
          }
        }}
        onCreateBoard={handleUpdateBoard}
        defaultValue={boardToEdit?.title || ""}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteBoardId}
        onOpenChange={(open) => !open && setDeleteBoardId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              board and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBoard}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPage;
