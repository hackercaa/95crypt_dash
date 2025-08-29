const removeToken = async (id: string, reason?: string, deletedBy?: string) => {
    try {
      if (!id) {
        throw new Error('Token ID is required');
      }
      
      if (!reason) {
        throw new Error('Deletion reason is required');
      }
      
      const response = await fetch(`http://localhost:3001/api/tokens/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim(),
          deletedBy: deletedBy || 'current_user'
        })
      });
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };