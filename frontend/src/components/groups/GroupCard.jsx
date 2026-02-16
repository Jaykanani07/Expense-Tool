import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;


const GroupCard = ({ group, onUpdated, onSelect, isSelected }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [desc, setDesc] = useState(group.description || "");

  const token = localStorage.getItem("token");

  const saveEdit = async () => {
    await fetch(`${API_BASE}/api/groups/${group._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description: desc }),
    });

    setEditing(false);
    onUpdated();
  };

  const deleteGroup = async () => {
    if (!window.confirm("Delete this group?")) return;

    await fetch(`${API_BASE}/api/groups/${group._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    onUpdated();
  };

  return (
    <div
      className={`group-card ${isSelected ? "active" : ""}`}
      onClick={!editing ? onSelect : undefined}
    >
      {editing ? (
        <div className="modal-backdrop">
          <div className="modal edit-group-modal">
            <h3>Edit Group</h3>

            <input value={name} onChange={(e) => setName(e.target.value)} />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <div className="edit-actions">
              <button
                className="secondary-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="group-card-header">
            <h4>{group.name}</h4>
            <div>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
              >
                ✏️
              </button>
              <button
                className="icon-btn danger"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteGroup();
                }}
              >
                🗑
              </button>
            </div>
          </div>

          <p>{group.description || "No description"}</p>
          <small>{group.members?.length || 0} member(s)</small>
        </>
      )}
    </div>
  );
};

export default GroupCard;
