import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Upload, Check, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/userSlice";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    dispatch(updateUser({
      ...currentUser,
      ...formData,
     
    }));
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Reuse your AppHeader */}
      {/* <AppHeader /> */}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
            Profile Settings
          </h1>
          <ThemeToggle />
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <Avatar className="h-32 w-32 mb-4 border-4 border-purple-500/20">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-4xl">
                  {currentUser?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                  <Upload className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <h2 className="text-2xl font-semibold">
              {editMode ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="text-center text-2xl font-semibold bg-transparent border-b"
                />
              ) : (
                currentUser?.name || "User"
              )}
            </h2>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </label>
                {editMode ? (
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                  />
                ) : (
                  <div className="p-2 px-3 rounded-md bg-secondary">
                    {currentUser?.email || "user@example.com"}
                  </div>
                )}
              </div>

              {/* <div className="space-y-2">
                <label className="flex items-center text-muted-foreground">
                  <Lock className="h-4 w-4 mr-2" />
                  Password
                </label>
                <Button
                  variant="outline"
                  className="w-full text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  onClick={() => navigate("/change-password")}
                >
                  Change Password
                </Button>
              </div> */}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-border">
              {editMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: currentUser?.name || "",
                        email: currentUser?.email || "",
                      });
                      setAvatarPreview(currentUser?.avatar || "");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 flex items-center"
                    onClick={handleSubmit}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 flex items-center"
                  onClick={() => setEditMode(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>  
  );
};

export default ProfilePage;