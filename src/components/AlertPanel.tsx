@@ .. @@
export const AlertPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
+  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    condition: 'above' as const,
    targetPrice: '',
    changePercent: '',
    message: ''
  });

+  // Load alerts from localStorage on component mount
+  useEffect(() => {
+    const savedAlerts = localStorage.getItem('globalAlerts');
+    if (savedAlerts) {
+      try {
+        const parsedAlerts = JSON.parse(savedAlerts);
+        setAlerts(parsedAlerts);
+      } catch (error) {
+        console.error('Error loading alerts:', error);
+      }
+    }
+  }, []);
+
+  // Save alerts to localStorage whenever alerts change
+  const saveAlertsToStorage = (updatedAlerts: Alert[]) => {
+    localStorage.setItem('globalAlerts', JSON.stringify(updatedAlerts));
+  };
+
   const handleCreateAlert = async (e: React.FormEvent) => {
     e.preventDefault();
@@ .. @@
     if (formData.condition === 'change' && !formData.changePercent) {
       toast.error('Change percentage is required');
       return;
     }
     
-    try {
-      const response = await fetch('http://localhost:3001/api/alerts', {
-        method: 'POST',
-        headers: { 'Content-Type': 'application/json' },
-        body: JSON.stringify({
-          ...formData,
-          targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
-          changePercent: formData.changePercent ? parseFloat(formData.changePercent) : undefined
-        })
-      });
-      
-      if (!response.ok) {
-        throw new Error('Failed to create alert');
-      }
-      
-      const alert = await response.json();
-      setAlerts([...alerts, alert]);
+    const newAlert: Alert = {
+      id: Date.now().toString(),
+      symbol: formData.symbol.toUpperCase(),
+      condition: formData.condition,
+      targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
+      changePercent: formData.changePercent ? parseFloat(formData.changePercent) : undefined,
+      message: formData.message,
+      created: Date.now(),
+      triggered: false
+    };
+
+    const updatedAlerts = [newAlert, ...alerts];
+    setAlerts(updatedAlerts);
+    saveAlertsToStorage(updatedAlerts);
+    
+    setShowCreateForm(false);
+    setFormData({ symbol: '', condition: 'above', targetPrice: '', changePercent: '', message: '' });
+    toast.success('Alert created successfully');
+  };
+
+  const handleEditAlert = (alert: Alert) => {
+    setEditingAlert(alert);
+    setFormData({
+      symbol: alert.symbol,
+      condition: alert.condition,
+      targetPrice: alert.targetPrice?.toString() || '',
+      changePercent: alert.changePercent?.toString() || '',
+      message: alert.message
+    });
+    setShowCreateForm(true);
+  };
+
+  const handleUpdateAlert = async (e: React.FormEvent) => {
+    e.preventDefault();
+    
+    if (!editingAlert) return;
+    
+    if (!formData.symbol.trim()) {
+      toast.error('Token symbol is required');
+      return;
+    }
+    
+    if (!formData.message.trim()) {
+      toast.error('Alert message is required');
+      return;
+    }
+    
+    if (formData.condition !== 'change' && !formData.targetPrice) {
+      toast.error('Target price is required');
+      return;
+    }
+    
+    if (formData.condition === 'change' && !formData.changePercent) {
+      toast.error('Change percentage is required');
+      return;
+    }
+    
+    const updatedAlert: Alert = {
+      ...editingAlert,
+      symbol: formData.symbol.toUpperCase(),
+      condition: formData.condition,
+      targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
+      changePercent: formData.changePercent ? parseFloat(formData.changePercent) : undefined,
+      message: formData.message,
+      triggered: false // Reset trigger status when edited
+    };
+
+    const updatedAlerts = alerts.map(alert => 
+      alert.id === editingAlert.id ? updatedAlert : alert
+    );
+    
+    setAlerts(updatedAlerts);
+    saveAlertsToStorage(updatedAlerts);
+    
+    setEditingAlert(null);
       setShowCreateForm(false);
       setFormData({ symbol: '', condition: 'above', targetPrice: '', changePercent: '', message: '' });
-      toast.success('Alert created successfully');
-    } catch (error) {
-      console.error('Error creating alert:', error);
-      toast.error('Failed to create alert');
-    }
+    toast.success('Alert updated successfully');
+  };
+
+  const cancelEdit = () => {
+    setEditingAlert(null);
+    setShowCreateForm(false);
+    setFormData({ symbol: '', condition: 'above', targetPrice: '', changePercent: '', message: '' });
   };

   const deleteAlert = (id: string) => {
-    setAlerts(alerts.filter(alert => alert.id !== id));
+    const updatedAlerts = alerts.filter(alert => alert.id !== id);
+    setAlerts(updatedAlerts);
+    saveAlertsToStorage(updatedAlerts);
     toast.success('Alert deleted');
   };

@@ .. @@
           <div className="flex items-center space-x-3 mb-6">
             <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
-              <Plus className="w-5 h-5 text-blue-400" />
+              {editingAlert ? <Settings className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
             </div>
             <div>
-              <h3 className="text-xl font-bold text-white">Create New Alert</h3>
-              <p className="text-gray-400">Set up a custom price alert for any token</p>
+              <h3 className="text-xl font-bold text-white">
+                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
+              </h3>
+              <p className="text-gray-400">
+                {editingAlert ? 'Modify your existing price alert' : 'Set up a custom price alert for any token'}
+              </p>
             </div>
           </div>
           
-          <form onSubmit={handleCreateAlert} className="space-y-6">
+          <form onSubmit={editingAlert ? handleUpdateAlert : handleCreateAlert} className="space-y-6">
@@ .. @@
             <div className="flex items-center space-x-4">
               <button
                 type="submit"
-                className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
+                className="bg-gradient-primary hover:shadow-glow text-gray-950 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
               >
-                Create Alert
+                {editingAlert ? (
+                  <>
+                    <Settings className="w-5 h-5" />
+                    <span>Update Alert</span>
+                  </>
+                ) : (
+                  <>
+                    <Plus className="w-5 h-5" />
+                    <span>Create Alert</span>
+                  </>
+                )}
               </button>
               <button
                 type="button"
-                onClick={() => setShowCreateForm(false)}
+                onClick={editingAlert ? cancelEdit : () => setShowCreateForm(false)}
                 className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
               >
                 Cancel
               </button>
             </div>
@@ .. @@
                   </div>
                   
                   <div className="flex items-center space-x-2">
+                    <button
+                      onClick={() => handleEditAlert(alert)}
+                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 rounded-lg transition-all duration-200"
+                      title="Edit this alert"
+                    >
+                      <Settings className="w-5 h-5" />
+                    </button>
                     {alert.triggered && (
                       <span className="badge-modern badge-success">
                         Triggered