
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              Organize your tasks with Kanban
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
              A simple and powerful Kanban board application to help you manage your projects 
              and collaborate with your team in real-time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => navigate("/login")}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white px-6 py-2 rounded-lg text-lg font-medium"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/register")}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white px-6 py-2 rounded-lg text-lg font-medium"
              >
                Register
              </Button>
            </div>
          </div>
          
          <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
              alt="Kanban Board Preview" 
              className="w-full h-auto" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-400">Create Boards</h3>
              <p className="text-gray-600 dark:text-gray-300">Organize your projects into boards with customizable columns and cards.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-400">Drag & Drop</h3>
              <p className="text-gray-600 dark:text-gray-300">Intuitively move tasks between different stages of completion.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-400">Collaborate</h3>
              <p className="text-gray-600 dark:text-gray-300">Work together with your team in real-time on shared boards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
