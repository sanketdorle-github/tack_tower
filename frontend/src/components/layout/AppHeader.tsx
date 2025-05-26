import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/userSlice";

interface AppHeaderProps {
  onCreateBoardClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onCreateBoardClick }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1
            className="text-xl font-bold text-purple-700 dark:text-purple-400 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            Kanban
          </h1>

          <div className="hidden md:flex items-center ml-8 space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-foreground hover:text-purple-700 dark:hover:text-purple-400"
            >
              Boards
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-purple-700 dark:hover:text-purple-400"
            >
              Workspaces
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative hidden md:block mx-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <ThemeToggle />

          <Button size="sm" variant="ghost" className="rounded-full p-2">
            <Bell className="h-5 w-5 text-foreground" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onCreateBoardClick}
            className="hidden md:flex items-center text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Plus className="h-4 w-4 mr-1" /> Create Board
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full p-0 h-9 w-9 bg-purple-100 dark:bg-purple-900/30"
              >
                <User className="h-5 w-5 text-purple-700 dark:text-purple-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-default">
                {currentUser?.email || "user@example.com"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
