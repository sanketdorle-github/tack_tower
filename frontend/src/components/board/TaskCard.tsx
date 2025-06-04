import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Edit, MoreHorizontal, Trash2, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AssignTaskDialog } from "./AssignTaskDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedUsers?: User[];
}

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  boardMembers: User[];
  onAssign: (users: User[]) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  index, 
  onEdit, 
  onDelete,
  boardMembers,
  onAssign,
}) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

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
            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
              )}
              {task.assignedUsers && task.assignedUsers.length > 0 && (
                <div className="flex -space-x-2 overflow-hidden pt-2">
                  {task.assignedUsers.map((user) => (
                    <Avatar
                      key={user._id}
                      className="h-6 w-6 border-2 border-background"
                    >
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              )}
            </div>
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
                  <DropdownMenuItem onClick={() => setIsAssignDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <AssignTaskDialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
            boardMembers={boardMembers}
            assignedUsers={task.assignedUsers || []}
            onAssign={onAssign}
            taskId={task.id}
          />
        </Card>
      )}
    </Draggable>
  );
};

export default TaskCard;