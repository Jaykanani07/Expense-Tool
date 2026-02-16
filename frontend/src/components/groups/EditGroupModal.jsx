import React, { useState } from "react";

const API_BASE = "http://localhost:5000";

const EditGroupModal = ({ group, onClose, onUpdated }) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/groups/${group._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update group");
        return;
      }

      onUpdated(data);
      onClose();
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit Group</h3>
        {editingGroup === group._id && (
  <div className="edit-form">
    <input
      type="text"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      placeholder="Group name"
    />

    <textarea
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      placeholder="Description"
    />

    <div className="edit-actions">
      <button onClick={() => updateGroup(group._id)}>Save</button>
      <button onClick={() => setEditingGroup(null)}>Cancel</button>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default EditGroupModal;
