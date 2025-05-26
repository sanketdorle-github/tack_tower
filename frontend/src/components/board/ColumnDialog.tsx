
import React, { useEffect, useState } from "react";
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

interface ColumnFormValues {
  title: string;
}

interface ColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column?: { id: string; title: string };
  onSave: (values: ColumnFormValues, columnId?: string) => void;
  isEditMode?: boolean;
}

const ColumnDialog: React.FC<ColumnDialogProps> = ({
  open,
  onOpenChange,
  column,
  onSave,
  isEditMode = false,
}) => {
  const [values, setValues] = useState<ColumnFormValues>({
    title: "",
  });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (column && isEditMode) {
      setValues({
        title: column.title || "",
      });
    } else {
      setValues({
        title: "",
      });
    }
  }, [column, isEditMode, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, title: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!values.title.trim()) {
      setError("Column title is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(values, column?.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving column:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Column" : "Add New Column"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <FormItem label="Title" error={error}>
              <Input
                placeholder="Enter column title"
                value={values.title}
                onChange={handleChange}
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
              {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Add Column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnDialog;
