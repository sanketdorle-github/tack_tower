import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/layout/AppHeader";
import BoardColumn from "@/components/board/BoardColumn";
import TaskDialog from "@/components/board/TaskDialog";
import ColumnDialog from "@/components/board/ColumnDialog";
import { Button } from "@/components/ui/button";
import { fetchBoards } from "@/utils/boardsData";
import {
  fetchBoardColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  moveColumn,
} from "@/utils/tasksData";
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
import { Board, Column, Task } from "@/types/board";
import { BoardHeader } from "@/components/board/BoardHeader";

const BoardPage = () => {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const { toast } = useToast();

  const [boards, setBoards] = useState<Board[]>([]); // Using Board interface instead of any
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(false);

  const boardFound = boardId ? boards.find((b) => b._id === boardId) : null;
  
  // console.log('Board Data Debug:', {
  //   boardId,
  //   boards,
  //   foundBoard: boardFound,
  //   boardTitle: boardFound?.title
  // });

  // Task Dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [selectedColumnId, setSelectedColumnId] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Column Dialog state
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<
    { id: string; title: string } | undefined
  >(undefined);
  const [isColumnEditMode, setIsColumnEditMode] = useState(false);

  // Delete Dialog state
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [deleteTaskInfo, setDeleteTaskInfo] = useState<{
    taskId: string;
    columnId: string;
  } | null>(null);

  // Check auth and fetch board data
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("token", token);

    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load boards
        const boardsData = await fetchBoards();
        setBoards(boardsData.data);

        // Load columns and tasks if we have a board ID
        if (boardId) {
          const columnsData = await fetchBoardColumns(boardId);
          setColumns(columnsData);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, boardId, toast]);

  // Optimistic UI update for drag and drop
  const handleDragEnd = async (result: DropResult) => {
    console.log("result in handleDrag", result);

    const { destination, source, draggableId, type } = result;

    // Dropped outside the list or at the same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    try {
      if (type === "column") {
        // Apply local state update immediately for smooth UI
        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedColumn);
        setColumns(newColumns);

        // Then send to backend
        moveColumn(draggableId, source.index, destination.index).catch(
          (error) => {
            // If the backend update fails, revert to original state
            toast({
              variant: "destructive",
              title: "Error",
              description:
                "Failed to update column position. Reverting changes.",
            });

            // Revert to original state
            const revertedColumns = [...columns];
            const [movedBackColumn] = revertedColumns.splice(
              destination.index,
              1
            );
            revertedColumns.splice(source.index, 0, movedBackColumn);
            setColumns(revertedColumns);
          }
        );
      } else {
        // TASK movement logic

        // Create optimistic update first
        setColumns((prevColumns) => {
          const newColumns = [...prevColumns];
          const sourceColIndex = newColumns.findIndex(
            (c) => c.id === source.droppableId
          );
          const destColIndex = newColumns.findIndex(
            (c) => c.id === destination.droppableId
          );

          if (sourceColIndex === -1 || destColIndex === -1) return prevColumns;

          const sourceCol = { ...newColumns[sourceColIndex] };
          const destCol = { ...newColumns[destColIndex] };

          // Remove from source
          const [movedTask] = sourceCol.tasks.splice(source.index, 1);

          // Update column reference if moving between lists
          if (source.droppableId !== destination.droppableId) {
            movedTask.columnId = destination.droppableId;
          }

          // Insert into destination
          destCol.tasks.splice(destination.index, 0, movedTask);

          // Update positions locally
          sourceCol.tasks = sourceCol.tasks.map((task, index) => ({
            ...task,
            position: index,
          }));

          destCol.tasks = destCol.tasks.map((task, index) => ({
            ...task,
            position: index,
          }));

          newColumns[sourceColIndex] = sourceCol;
          newColumns[destColIndex] = destCol;

          return newColumns;
        });

        // Prepare data for backend
        const sourceCardOrder =
          columns
            .find((c) => c.id === source.droppableId)
            ?.tasks.map((t) => t.id) || [];

        const destinationCardOrder =
          columns
            .find((c) => c.id === destination.droppableId)
            ?.tasks.map((t) => t.id) || [];

        await moveTask(
          draggableId,
          source.droppableId,
          destination.droppableId,
          sourceCardOrder,
          destinationCardOrder
        );
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update item position. Please try again.",
      });
    }
  };

  // Task CRUD operations
  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setSelectedTask(undefined);
    setIsEditMode(false);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (taskId: string, columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    const task = column.tasks.find((t) => t.id === taskId);
    if (!task) return;

    setSelectedColumnId(columnId);
    setSelectedTask(task);
    setIsEditMode(true);
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    setDeleteTaskInfo({ taskId, columnId });
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskInfo) return;

    try {
      const { taskId, columnId } = deleteTaskInfo;
      await deleteTask(taskId, columnId);

      // Update local state
      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                tasks: column.tasks.filter((task) => task.id !== taskId),
              }
            : column
        )
      );

      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task. Please try again.",
      });
    } finally {
      setDeleteTaskInfo(null);
    }
  };

  // Save task (create or update)
  const handleSaveTask = async (
    values: { title: string; description: string },
    taskId?: string,
    columnId?: string
  ) => {
    try {
      if (isEditMode && taskId && columnId) {
        // Update existing task
        const result = await updateTask(
          taskId,
          columnId,
          values.title,
          values.description
        );

        // Update local state
        setColumns((prevColumns) =>
          prevColumns.map((column) =>
            column.id === columnId
              ? {
                  ...column,
                  tasks: column.tasks.map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          title: values.title,
                          description: values.description,
                        }
                      : task
                  ),
                }
              : column
          )
        );

        toast({
          title: "Success",
          description: "Task updated successfully!",
        });
      } else if (columnId) {
        // Create new task
        const newTask = await createTask(
          columnId,
          values.title,
          values.description
        );

        // Update local state
        setColumns((prevColumns) =>
          prevColumns.map((column) =>
            column.id === columnId
              ? { ...column, tasks: [...column.tasks, newTask] }
              : column
          )
        );

        toast({
          title: "Success",
          description: "Task created successfully!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save task. Please try again.",
      });
    }
  };

  // Column CRUD operations
  const handleAddColumn = () => {
    setSelectedColumn(undefined);
    setIsColumnEditMode(false);
    setColumnDialogOpen(true);
  };

  const handleEditColumn = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    setSelectedColumn({ id: column.id, title: column.title });
    setIsColumnEditMode(true);
    setColumnDialogOpen(true);
  };

  const handleDeleteColumn = (columnId: string) => {
    setDeleteColumnId(columnId);
  };

  const confirmDeleteColumn = async () => {
    if (!deleteColumnId) return;

    try {
      await deleteColumn(deleteColumnId);

      // Update local state
      setColumns((prevColumns) =>
        prevColumns.filter((column) => column.id !== deleteColumnId)
      );

      toast({
        title: "Success",
        description: "Column deleted successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete column. Please try again.",
      });
    } finally {
      setDeleteColumnId(null);
    }
  };

  // Save column (create or update)
  const handleSaveColumn = async (
    values: { title: string },
    columnId?: string
  ) => {
    try {
      if (isColumnEditMode && columnId) {
        // Update existing column
        await updateColumn(columnId, values.title);

        // Update local state
        setColumns((prevColumns) =>
          prevColumns.map((column) =>
            column.id === columnId ? { ...column, title: values.title } : column
          )
        );

        toast({
          title: "Success",
          description: "Column updated successfully!",
        });
      } else if (boardId) {
        // Create new column
        const newColumn = await createColumn(values.title, boardId);

        // Update local state
        setColumns((prevColumns) => [...prevColumns, newColumn]);

        toast({
          title: "Success",
          description: "Column created successfully!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save column. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <AppHeader />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-72 h-96 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!boardId || (!loading && !boardFound)) {
    console.log("in here", boardFound);

    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <AppHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-xl text-gray-600 dark:text-gray-300">
            Board not found
          </h2>
          <button
            onClick={() => {
              navigate("/dashboard");
            }}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AppHeader />

      <div className="container mx-auto px-4 py-6">
        
        {/* //board header */}
        <BoardHeader
          boardDet={boardFound}
          onAddColumn={handleAddColumn}
          boardId={boardId}
        />
        {columns.length < 1 ? (
          <div className="w-full min-h-svh flex items-center justify-center bg-red-600">
            <h1>No list Available</h1>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="all-columns"
              direction="horizontal"
              type="column"
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex overflow-x-auto pb-4 transition-colors duration-300 ${
                    snapshot.isDraggingOver
                      ? "bg-purple-50/20 dark:bg-purple-900/10 rounded-lg"
                      : ""
                  }`}
                  style={{ minHeight: "calc(100vh - 180px)" }}
                >
                  {columns.map((column, index) => (
                    <BoardColumn
                      key={column.id}
                      id={column.id}
                      title={column.title}
                      tasks={column.tasks}
                      index={index}
                      onAddTask={handleAddTask}
                      onEditColumn={handleEditColumn}
                      onDeleteColumn={handleDeleteColumn}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={selectedTask}
        columnId={selectedColumnId}
        onSave={handleSaveTask}
        isEditMode={isEditMode}
      />

      {/* Column Dialog */}
      <ColumnDialog
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        column={selectedColumn}
        onSave={handleSaveColumn}
        isEditMode={isColumnEditMode}
      />

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTaskInfo}
        onOpenChange={(open) => !open && setDeleteTaskInfo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Column Confirmation Dialog */}
      <AlertDialog
        open={!!deleteColumnId}
        onOpenChange={(open) => !open && setDeleteColumnId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this column and all its tasks?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteColumn}
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

export default BoardPage;
