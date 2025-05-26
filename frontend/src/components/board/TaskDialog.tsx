
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
import { Textarea } from "@/components/ui/textarea";
import FormItem from "@/components/ui/form-item";

interface TaskFormValues {
  title: string;
  description: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: { id: string; title: string; description?: string };
  columnId: string;
  onSave: (values: TaskFormValues, taskId?: string, columnId?: string) => void;
  isEditMode?: boolean;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  columnId,
  onSave,
  isEditMode = false,
}) => {
  const [values, setValues] = useState<TaskFormValues>({
    title: "",
    description: "",
  });
  
  const [errors, setErrors] = useState<Partial<TaskFormValues>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task && isEditMode) {
      setValues({
        title: task.title || "",
        description: task.description || "",
      });
    } else {
      setValues({
        title: "",
        description: "",
      });
    }
  }, [task, isEditMode, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof TaskFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormValues> = {};
    
    if (!values.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(values, task?.id, columnId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <FormItem label="Title" error={errors.title}>
              <Input
                name="title"
                placeholder="Enter task title"
                value={values.title}
                onChange={handleChange}
                autoFocus
              />
            </FormItem>
            
            <FormItem label="Description (optional)">
              <Textarea
                name="description"
                placeholder="Enter task description"
                value={values.description}
                onChange={handleChange}
                rows={3}
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
              {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
