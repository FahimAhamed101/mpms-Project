// app/components/KanbanBoard.tsx
'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useUpdateTaskMutation } from '@/app/lib/api/taskApi';
import { TaskStatus, TaskPriority, Task, User } from '@/app/types'; // Use TaskPriority instead of Priority
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Flag, 
  User as UserIcon, 
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const KanbanBoard = ({ tasks, onTaskClick, onEditTask, onDeleteTask }: KanbanBoardProps) => {
  const [updateTask] = useUpdateTaskMutation();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const columns = {
    [TaskStatus.TODO]: {
      title: 'To Do',
      icon: AlertCircle,
      color: 'bg-gray-100 text-gray-700',
      tasks: tasks.filter(task => task.status === TaskStatus.TODO),
    },
    [TaskStatus.IN_PROGRESS]: {
      title: 'In Progress',
      icon: Clock,
      color: 'bg-blue-100 text-blue-700',
      tasks: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
    },
    [TaskStatus.REVIEW]: {
      title: 'Review',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
      tasks: tasks.filter(task => task.status === TaskStatus.REVIEW),
    },
    [TaskStatus.DONE]: {
      title: 'Done',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
      tasks: tasks.filter(task => task.status === TaskStatus.DONE),
    },
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-gray-100 text-gray-700';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-700';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-700';
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;

    try {
      await updateTask({
        id: taskId,
        status: newStatus,
      }).unwrap();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to safely get assignee info
  const getAssigneeInfo = (assignee: string | User) => {
    if (typeof assignee === 'string') {
      return { _id: assignee, name: 'Unknown', avatar: undefined };
    }
    return assignee;
  };

  // Helper function to check if a value is a User object
  const isUserObject = (assignee: string | User): assignee is User => {
    return typeof assignee === 'object' && assignee !== null;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto p-4">
        {Object.entries(columns).map(([status, column]) => {
          const ColumnIcon = column.icon;
          
          return (
            <div key={status} className="flex-1 min-w-[320px] max-w-[400px]">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Column Header */}
                <div className={`p-4 rounded-t-lg ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ColumnIcon className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">{column.title}</h3>
                    </div>
                    <span className="px-2 py-1 text-sm font-medium bg-white rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                </div>

                {/* Task List */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 min-h-[600px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-gray-50' : ''
                      }`}
                    >
                      {column.tasks.map((task, index) => {
                        // Get assignees that are User objects
                        const userAssignees = task.assignees?.filter(isUserObject) || [];
                        
                        return (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 bg-white rounded-lg border shadow-sm transition-all ${
                                  snapshot.isDragging ? 'shadow-lg rotate-1' : 'hover:shadow-md'
                                } ${
                                  task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="p-4">
                                  {/* Task Header */}
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                          task.priority as TaskPriority
                                        )}`}
                                      >
                                        <Flag className="h-3 w-3 inline mr-1" />
                                        {task.priority}
                                      </span>
                                      {task.dueDate && (
                                        <span className="flex items-center text-xs text-gray-500">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          {formatDate(task.dueDate)}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="relative">
                                      <button
                                        onClick={() => setSelectedTask(
                                          selectedTask === task._id ? null : task._id
                                        )}
                                        className="p-1 hover:bg-gray-100 rounded"
                                      >
                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                      </button>
                                      
                                      {selectedTask === task._id && (
                                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                          {onEditTask && (
                                            <button
                                              onClick={() => {
                                                onEditTask(task);
                                                setSelectedTask(null);
                                              }}
                                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                              <Edit className="h-4 w-4 mr-2" />
                                              Edit Task
                                            </button>
                                          )}
                                          {onDeleteTask && (
                                            <button
                                              onClick={() => {
                                                onDeleteTask(task._id);
                                                setSelectedTask(null);
                                              }}
                                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete Task
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Task Content */}
                                  <div 
                                    className="cursor-pointer"
                                    onClick={() => onTaskClick && onTaskClick(task)}
                                  >
                                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                      {task.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                      {task.description}
                                    </p>

                                    {/* Assignees */}
                                    {userAssignees.length > 0 && (
                                      <div className="flex items-center mb-3">
                                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <div className="flex -space-x-2">
                                          {userAssignees.slice(0, 3).map((assignee) => {
                                            const assigneeInfo = getAssigneeInfo(assignee);
                                            return (
                                              <div
                                                key={assigneeInfo._id}
                                                className="h-6 w-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                                                title={assigneeInfo.name}
                                              >
                                                {assigneeInfo.avatar ? (
                                                  <img
                                                    src={assigneeInfo.avatar}
                                                    alt={assigneeInfo.name}
                                                    className="h-full w-full rounded-full"
                                                  />
                                                ) : (
                                                  <span className="text-xs font-medium text-blue-600">
                                                    {assigneeInfo.name?.charAt(0).toUpperCase() || '?'}
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })}
                                          {userAssignees.length > 3 && (
                                            <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                              <span className="text-xs font-medium text-gray-600">
                                                +{userAssignees.length - 3}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Time Tracking */}
                                    {(task.estimatedHours || task.actualHours) && (
                                      <div className="flex items-center text-xs text-gray-500">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {task.actualHours && (
                                          <span className="font-medium mr-1">
                                            {task.actualHours}h
                                          </span>
                                        )}
                                        {task.estimatedHours && (
                                          <span className="text-gray-400">
                                            / {task.estimatedHours}h
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      
                      {/* Empty State */}
                      {column.tasks.length === 0 && (
                        <div className="text-center py-8">
                          <div className="inline-block p-3 rounded-full bg-gray-100 mb-3">
                            <ColumnIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">No tasks in this column</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;