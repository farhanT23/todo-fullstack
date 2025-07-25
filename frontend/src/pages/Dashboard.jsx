import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isCompleted, setIsCompleted] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/todo');
      console.log('Todos fetched successfully:', res.data);
      setTodos(res.data);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError('Failed to load todos. Please try again.');
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('currentUser');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const res = await apiClient.post('/todo/create', {
        title,
        description,
        priority,
        is_completed: isCompleted,
      });
      setTodos([res.data, ...todos]);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setIsCompleted(false);
    } catch (err) {
      console.error('Create failed:', err);
      setError('Failed to create todo. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/todo/delete/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete todo. Please try again.');
    }
  };

  const startEditing = (todo) => {
    setEditingTodoId(todo.id);
    setEditData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      is_completed: todo.is_completed,
    });
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await apiClient.put(`/todo/update/${id}`, editData);
      setTodos(
        todos.map((todo) => (todo.id === id ? res.data : todo))
      );
      cancelEditing();
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update todo. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your todos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTodos}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => setError('')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-700">📋 Todo Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Create Todo Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Todo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-2"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-2 h-20"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700">Mark as completed</span>
            </label>
            <button
              onClick={handleCreate}
              disabled={!title.trim()}
              className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded transition duration-200"
            >
              ➕ Add Todo
            </button>
          </div>
        </div>

        {/* Todo Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="text-2xl font-bold text-blue-600">{todos.length}</h3>
              <p className="text-gray-600">Total Todos</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="text-2xl font-bold text-green-600">
                {todos.filter(todo => todo.is_completed).length}
              </h3>
              <p className="text-gray-600">Completed</p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <h3 className="text-2xl font-bold text-orange-600">
                {todos.filter(todo => !todo.is_completed).length}
              </h3>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Todos</h2>
          <div className="space-y-4">
            {todos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No todos yet. Start adding some!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`border rounded-lg p-4 transition duration-200 ${
                    todo.is_completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {editingTodoId === todo.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => handleEditChange('title', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Title"
                      />
                      <textarea
                        value={editData.description}
                        onChange={(e) => handleEditChange('description', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                        placeholder="Description"
                      />
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <select
                          value={editData.priority}
                          onChange={(e) => handleEditChange('priority', e.target.value)}
                          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editData.is_completed}
                            onChange={(e) => handleEditChange('is_completed', e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                          <span className="text-gray-700">Completed</span>
                        </label>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdate(todo.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-200"
                        >
                          ✅ Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${
                          todo.is_completed ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}>
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className={`text-gray-600 mb-2 ${
                            todo.is_completed ? 'line-through' : ''
                          }`}>
                            {todo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-white ${
                            todo.priority === 'high' ? 'bg-red-500' :
                            todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}>
                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                          </span>
                          {todo.is_completed && (
                            <span className="text-green-600 font-medium">✅ Completed</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 md:mt-0 flex space-x-3">
                        <button
                          onClick={() => startEditing(todo)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition duration-200"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition duration-200"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}