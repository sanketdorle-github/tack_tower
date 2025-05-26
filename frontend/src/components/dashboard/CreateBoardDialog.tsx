import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormItem from "@/components/ui/form-item";

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBoard: (title: string) => void;
  loadBoardsFunc: () => void;
  defaultValue?: string; // Added defaultValue as an optional prop
}

const CreateBoardDialog: React.FC<CreateBoardDialogProps> = ({
  open,
  onOpenChange,
  onCreateBoard,
  loadBoardsFunc,
  defaultValue = "", // Default to empty string if not provided
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set title when defaultValue changes or dialog opens
  useEffect(() => {
    if (open && defaultValue) {
      setTitle(defaultValue);
    } else if (!open) {
      // Reset form when dialog closes
      setTitle("");
      setError("");
    }
  }, [open, defaultValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Board title is required");
      return;
    }

    setIsLoading(true);

    try {
      await onCreateBoard(title);
      setTitle("");
      setError("");
      onOpenChange(false);
      loadBoardsFunc();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create board. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValue ? "Edit" : "Create New"} Board
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <FormItem label="Board Title" error={error}>
              <Input
                placeholder="Enter board title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                autoFocus
              />
            </FormItem>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? defaultValue
                  ? "Updating..."
                  : "Creating..."
                : defaultValue
                ? "Update Board"
                : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardDialog;
