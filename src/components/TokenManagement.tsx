@@ .. @@
   const handleDeleteToken = async (reason: string) => {
     if (!tokenToDelete) return;

     try {
       const deletedToken: DeletedToken = {
         id: tokenToDelete.id,
         symbol: tokenToDelete.symbol,
         name: tokenToDelete.name,
         exchanges: tokenToDelete.exchanges,
         dateAdded: tokenToDelete.added,
         dateDeleted: Date.now(),
         deletionReason: reason,
         deletedBy: 'current_user'
       };

       setDeletedTokens(prev => [deletedToken, ...prev]);
       
       // Use the onRemoveToken prop with reason and deletedBy
       await onRemoveToken(tokenToDelete.id, reason, 'current_user');
       
       toast.success(`${tokenToDelete.symbol} deleted successfully`);
       setTokenToDelete(null);
     } catch (error) {
       console.error('Error deleting token:', error);
       toast.error('Failed to delete token');
     }
   };