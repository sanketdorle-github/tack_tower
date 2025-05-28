import { Plus, Search, Share2, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addBoardMember, searchUsers } from "../../store/slices/userSlice";
import { cn } from "@/lib/utils";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Board {
  _id: string;
  title: string;
  description?: string;
  createdBy?: string;
  members?: string[];
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BoardHeaderProps {
  boardDet: Board;
  onAddColumn: () => void;
  boardId: string;
}

export const BoardHeader = ({
  boardDet,
  onAddColumn,
  boardId,
}: BoardHeaderProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [currentMembers, setCurrentMembers] = useState<User[]>([]);

  console.log('Board Data:', {
    boardDet,
  
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<User[]>({
    queryKey: ["userSearch", searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length > 2,
  });

  // Query to fetch current board members
  const { data: boardMembers } = useQuery({
    queryKey: ["boardMembers", boardId],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/api/v1/board/${boardId}/members`, {
      withCredentials: true,
      });
      if (!response) {
        throw new Error('Failed to fetch board members');
      }
      const data = response.data;
      return data.data;
    }
  });

  useEffect(() => {
    if (boardMembers) {
      setCurrentMembers(boardMembers);
    }
  }, [boardMembers]);

  const handleShareBoard = async () => {
    if (!selectedUsers.length) return;

    // console.log('Sharing board with users:', {
    //   boardId,
    //   selectedUsers: selectedUsers.map(user => ({
    //     _id: user._id,
    //     name: user.name,
    //     email: user.email
    //   }))
    // });

    try {
      await Promise.all(
        selectedUsers.map((user) => addBoardMember(boardId, user._id))
      );

      toast({
        title: "Success",
        description: `Board shared with ${selectedUsers.length} user${
          selectedUsers.length !== 1 ? "s" : ""
        }`,
      });

      resetShareState();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share board. Please try again.",
      });
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const newSelected = prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user];
      
      // console.log('Selected Users:', {
      //   action: prev.some((u) => u._id === user._id) ? 'Removed' : 'Added',
      //   user: {
      //     _id: user._id,
      //     name: user.name,
      //     email: user.email
      //   },
      //   totalSelected: newSelected.length,
      //   allSelectedUsers: newSelected
      // });
      
      return newSelected;
    });
  };

  const resetShareState = () => {
    setSearchQuery("");
    setSelectedUsers([]);
    setIsShareDialogOpen(false);
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some((u) => u._id === userId);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {boardDet?.title || 'Untitled Board'}
        </h1>
        {currentMembers.length > 0 && (
          <div className="flex -space-x-2">
            {currentMembers.slice(0, 3).map((member) => (
              <Avatar
                key={member._id}
                className="h-8 w-8 border-2 border-white dark:border-gray-900"
              >
                <AvatarImage src={member.avatar} />
                <AvatarFallback>
                  {member.name?.charAt(0) || member.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {currentMembers.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-sm">
                +{currentMembers.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Share Board</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current Members Section */}
              {currentMembers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current members
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name?.charAt(0) || member.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name || member.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Users Section */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
                  <p className="w-full text-sm text-gray-500 mb-2">Users to add:</p>
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
                        aria-label="Remove user"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Search Results */}
              <div className="max-h-60 overflow-y-auto">
                {isSearching ? (
                  <p className="text-center py-4 text-sm text-gray-500">
                    Searching...
                  </p>
                ) : searchResults?.length ? (
                  <ul className="space-y-2">
                    {searchResults
                      .filter(user => !currentMembers.some(member => member._id === user._id))
                      .map((user) => {
                        const selected = isUserSelected(user._id);
                        return (
                          <li
                            key={user._id}
                            onClick={() => toggleUserSelection(user)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                              "hover:bg-gray-100 dark:hover:bg-gray-800",
                              selected && "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                            )}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name?.charAt(0) || user.email?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-sm text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                              selected 
                                ? "bg-purple-600 border-purple-600 text-white" 
                                : "border-gray-300 dark:border-gray-600"
                            )}>
                              {selected && <Check className="h-3 w-3" />}
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                ) : searchQuery.length > 2 ? (
                  <p className="text-center py-4 text-sm text-gray-500">
                    No users found
                  </p>
                ) : (
                  <p className="text-center py-4 text-sm text-gray-500">
                    Start typing to search for users
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetShareState} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleShareBoard}
                  disabled={!selectedUsers.length}
                  className="flex-1"
                >
                  Share ({selectedUsers.length})
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={onAddColumn}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Column
        </Button>
      </div>
    </div>
  );
};
