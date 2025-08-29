@@ .. @@
         {activeTab === 'management' && (
             <div className="animate-slide-up">
               <TokenManagement 
                 tokens={tokens}
                 onAddToken={handleAddToken}
                 onRemoveToken={removeToken}
               />
             </div>
         )}