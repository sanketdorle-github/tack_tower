import React from "react";
import { Check, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardMembers: User[];
  assignedUsers: User[];
  onAssign: (users: User[]) => void;
}

export const AssignTaskDialog: React.FC<AssignTaskDialogProps> = ({
  open,
  onOpenChange,
  boardMembers,
  assignedUsers,
  onAssign,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>(assignedUsers);

  // Reset selected users when dialog opens
  React.useEffect(() => {
    setSelectedUsers(assignedUsers);
  }, [assignedUsers, open]);

  const filteredMembers = boardMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleSave = () => {
    onAssign(selectedUsers);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border shadow-sm"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name || user.email}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {filteredMembers.map((member) => {
                const isSelected = selectedUsers.some(
                  (u) => u._id === member._id
                );
                return (
                  <div
                    key={member._id}
                    onClick={() => toggleUserSelection(member)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      isSelected &&
                        "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name?.charAt(0) || member.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 