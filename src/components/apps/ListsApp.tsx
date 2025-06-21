
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Clock, Star, MoreHorizontal, Check, Bell, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date | null;
  reminderDate: Date | null;
  tags: string[];
  teslaRelated: boolean;
  location: { address: string; lat: number; lng: number } | null;
  created: number;
  modified: number;
  completedDate: number | null;
}

interface TaskList {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  tasks: Task[];
  created: number;
  modified: number;
}

class TaskManager {
  private lists = new Map<string, TaskList>();
  
  constructor() {
    this.loadFromStorage();
    this.initializeDefaultLists();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('tesla_lists');
      if (saved) {
        const data = JSON.parse(saved);
        this.lists = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load lists from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Array.from(this.lists.entries());
      localStorage.setItem('tesla_lists', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save lists to storage:', error);
    }
  }

  private initializeDefaultLists() {
    if (this.lists.size === 0) {
      const teslaList = this.createList('Tesla Tasks', 'tesla', { 
        color: '#E31937', 
        icon: '🚗' 
      });
      
      const maintenanceList = this.createList('Maintenance', 'maintenance', { 
        color: '#FF9500', 
        icon: '🔧' 
      });
      
      // Add sample Tesla tasks
      this.addTask(teslaList.id, {
        title: 'Check tire pressure',
        description: 'Monthly tire pressure check for optimal performance',
        priority: 'medium',
        teslaRelated: true,
        tags: ['maintenance', 'monthly'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });

      this.addTask(teslaList.id, {
        title: 'Schedule service appointment',
        description: 'Annual service check at Tesla Service Center',
        priority: 'high',
        teslaRelated: true,
        tags: ['service', 'annual']
      });
    }
  }

  createList(name: string, category: string = 'general', options: any = {}): TaskList {
    const list: TaskList = {
      id: `list_${Date.now()}`,
      name,
      category,
      color: options.color || '#007AFF',
      icon: options.icon || '📝',
      tasks: [],
      created: Date.now(),
      modified: Date.now()
    };
    
    this.lists.set(list.id, list);
    this.saveToStorage();
    return list;
  }

  addTask(listId: string, taskData: Partial<Task>): Task | null {
    const list = this.lists.get(listId);
    if (!list) return null;
    
    const task: Task = {
      id: `task_${Date.now()}`,
      title: taskData.title || '',
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      reminderDate: taskData.reminderDate || null,
      tags: taskData.tags || [],
      teslaRelated: taskData.teslaRelated || false,
      location: taskData.location || null,
      created: Date.now(),
      modified: Date.now(),
      completedDate: null
    };
    
    list.tasks.push(task);
    list.modified = Date.now();
    this.saveToStorage();
    return task;
  }

  toggleTask(listId: string, taskId: string): boolean {
    const list = this.lists.get(listId);
    if (!list) return false;
    
    const task = list.tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    task.completed = !task.completed;
    task.completedDate = task.completed ? Date.now() : null;
    task.modified = Date.now();
    list.modified = Date.now();
    
    this.saveToStorage();
    return true;
  }

  getLists(): TaskList[] {
    return Array.from(this.lists.values());
  }

  getList(id: string): TaskList | undefined {
    return this.lists.get(id);
  }
}

const ListsApp: React.FC = () => {
  const [taskManager] = useState(() => new TaskManager());
  const [lists, setLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskOptions, setShowNewTaskOptions] = useState(false);

  useEffect(() => {
    refreshLists();
  }, []);

  const refreshLists = () => {
    const allLists = taskManager.getLists();
    setLists(allLists);
    if (!selectedListId && allLists.length > 0) {
      setSelectedListId(allLists[0].id);
    }
  };

  const selectedList = selectedListId ? taskManager.getList(selectedListId) : null;

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedListId) return;
    
    taskManager.addTask(selectedListId, {
      title: newTaskTitle.trim(),
      priority: 'medium'
    });
    
    setNewTaskTitle('');
    setShowNewTaskOptions(false);
    refreshLists();
    
    toast({
      title: "Task Added",
      description: `"${newTaskTitle}" added to ${selectedList?.name}`,
    });
  };

  const handleToggleTask = (taskId: string) => {
    if (!selectedListId) return;
    
    const success = taskManager.toggleTask(selectedListId, taskId);
    if (success) {
      refreshLists();
      const task = selectedList?.tasks.find(t => t.id === taskId);
      toast({
        title: task?.completed ? "Task Completed" : "Task Reopened",
        description: task?.title,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverdueTasks = () => {
    if (!selectedList) return 0;
    const now = Date.now();
    return selectedList.tasks.filter(task => 
      !task.completed && task.dueDate && task.dueDate.getTime() < now
    ).length;
  };

  const getCompletedTasks = () => {
    if (!selectedList) return 0;
    return selectedList.tasks.filter(task => task.completed).length;
  };

  return (
    <div className="h-full bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <h1 className="text-2xl font-bold mb-2">Lists & Reminders</h1>
          <p className="text-green-100">Stay organized with Tesla integration</p>
          
          <Button 
            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => {
              const newList = taskManager.createList('New List', 'general');
              refreshLists();
              setSelectedListId(newList.id);
            }}
          >
            <Plus size={16} className="mr-2" />
            New List
          </Button>
        </div>

        {/* Lists Collection */}
        <div className="flex-1 overflow-y-auto p-4">
          {lists.map((list) => {
            const incompleteTasks = list.tasks.filter(t => !t.completed).length;
            const overdueTasks = list.tasks.filter(t => 
              !t.completed && t.dueDate && t.dueDate.getTime() < Date.now()
            ).length;
            
            return (
              <div
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedListId === list.id 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: list.color }}
                >
                  <span className="text-sm">{list.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{list.name}</div>
                  <div className="text-sm text-gray-500">
                    {incompleteTasks} tasks
                    {overdueTasks > 0 && (
                      <span className="text-red-500 ml-2">• {overdueTasks} overdue</span>
                    )}
                  </div>
                </div>
                {incompleteTasks > 0 && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                    {incompleteTasks}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedList ? (
          <>
            {/* Content Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedList.name}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedList.tasks.length} total • {getCompletedTasks()} completed
                    {getOverdueTasks() > 0 && (
                      <span className="text-red-500 ml-2">• {getOverdueTasks()} overdue</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add Task Section */}
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    className="flex-1 text-lg border-none outline-none bg-transparent"
                  />
                  <Button 
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                    size="sm"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                {showNewTaskOptions && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Button variant="outline" size="sm">
                      <Calendar size={14} className="mr-1" />
                      Due Date
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bell size={14} className="mr-1" />
                      Reminder
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin size={14} className="mr-1" />
                      Location
                    </Button>
                    <Button variant="outline" size="sm">
                      <Car size={14} className="mr-1" />
                      Tesla
                    </Button>
                  </div>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {selectedList.tasks
                  .sort((a, b) => {
                    if (a.completed !== b.completed) {
                      return a.completed ? 1 : -1;
                    }
                    return b.created - a.created;
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 transition-all hover:shadow-md ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center transition-all ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {task.completed && <Check size={12} />}
                        </button>
                        
                        <div className="flex-1">
                          <div className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </div>
                          
                          {task.description && (
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 mt-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 text-xs ${
                                task.dueDate.getTime() < Date.now() && !task.completed
                                  ? 'text-red-600 font-semibold'
                                  : 'text-gray-500'
                              }`}>
                                <Calendar size={12} />
                                {task.dueDate.toLocaleDateString()}
                              </div>
                            )}
                            
                            {task.location && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin size={12} />
                                {task.location.address}
                              </div>
                            )}
                            
                            {task.teslaRelated && (
                              <div className="flex items-center gap-1 text-xs text-red-600">
                                <Car size={12} />
                                Tesla
                              </div>
                            )}
                          </div>
                          
                          {task.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {task.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No List Selected</h3>
              <p className="text-gray-600">Choose a list from the sidebar to view tasks</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListsApp;
