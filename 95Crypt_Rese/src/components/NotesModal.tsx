import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, MessageSquare, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  author: string;
}

interface NotesModalProps {
  tokenSymbol: string;
  tokenName: string;
  onClose: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ tokenSymbol, tokenName, onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${tokenSymbol}`);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, [tokenSymbol]);

  // Save notes to localStorage whenever notes change
  const saveNotesToStorage = (updatedNotes: Note[]) => {
    localStorage.setItem(`notes_${tokenSymbol}`, JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) {
      toast.error('Please enter a note');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: 'current_user' // In real app, get from auth context
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setNewNoteContent('');
    setIsAddingNote(false);
    toast.success('Note added successfully');
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNoteId(noteId);
      setEditContent(note.content);
    }
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    const updatedNotes = notes.map(note =>
      note.id === editingNoteId
        ? { ...note, content: editContent.trim(), updatedAt: Date.now() }
        : note
    );

    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setEditingNoteId(null);
    setEditContent('');
    toast.success('Note updated successfully');
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    toast.success('Note deleted successfully');
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const sortedNotes = [...notes].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-850 to-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notes for {tokenSymbol}</h2>
              <p className="text-gray-400 text-sm">{tokenName} - Personal notes and observations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[60vh]">
          {/* Add Note Section */}
          <div className="p-6 border-b border-gray-700 bg-gray-850/30">
            {!isAddingNote ? (
              <button
                onClick={() => setIsAddingNote(true)}
                className="w-full bg-gradient-primary hover:shadow-glow text-gray-950 px-4 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Note</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    New Note
                  </label>
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Enter your note about this token..."
                    autoFocus
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAddNote}
                    className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Note</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteContent('');
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-6">
            {sortedNotes.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No notes yet</h3>
                <p className="text-gray-400">Add your first note to track observations about {tokenSymbol}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    Notes ({sortedNotes.length})
                  </h3>
                  <div className="text-sm text-gray-400">
                    Sorted by newest first
                  </div>
                </div>

                {sortedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gray-850/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                  >
                    {editingNoteId === note.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={4}
                          autoFocus
                        />
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-gradient-primary hover:shadow-glow text-gray-950 px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{note.author}</div>
                              <div className="text-xs text-gray-400 flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                {note.updatedAt !== note.createdAt && (
                                  <span className="text-yellow-400">(edited {format(new Date(note.updatedAt), 'MMM dd, HH:mm')})</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditNote(note.id)}
                              className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-gray-700"
                              title="Edit this note"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-gray-700"
                              title="Delete this note"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};