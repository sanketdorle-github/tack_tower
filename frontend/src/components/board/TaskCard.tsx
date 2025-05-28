
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 p-3 group transition-all duration-150 ease-out ${
            snapshot.isDragging 
              ? "shadow-lg scale-[1.02] border-purple-300 dark:border-purple-700 z-10" 
              : "shadow-sm hover:shadow-md"
          } bg-white dark:bg-gray-800 border-border`}
          style={{
            ...provided.draggableProps.style,
            transformOrigin: "center",
          }}
        >
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{task.description}</p>
          )}
        </Card>
      )}
    </Draggable>
  );
};

export default TaskCard;