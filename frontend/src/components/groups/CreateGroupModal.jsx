import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const CreateGroupModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([{ name: "", phone: "" }]);

  const create = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        members: members.filter((m) => m.name && m.phone),
      }),
    });
    const g = await res.json();
    onCreated(g);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Create Group</h3>

        <input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        {members.map((m, i) => (
          <div key={i} className="member-row">
            <input placeholder="Name" value={m.name} onChange={(e) => {
              const copy = [...members]; copy[i].name = e.target.value; setMembers(copy);
            }} />
            <input placeholder="Phone" value={m.phone} onChange={(e) => {
              const copy = [...members]; copy[i].phone = e.target.value; setMembers(copy);
            }} />
          </div>
        ))}

        <button className="secondary-btn" onClick={() => setMembers([...members, { name: "", phone: "" }])}>
          + Add Member
        </button>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" onClick={create}>Create</button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
