import React, { useEffect, useState } from "react";
import GroupCard from "./GroupCard";
import GroupDetails from "./GroupDetails";
import "./Groups.css";

const API_BASE = import.meta.env.VITE_API_URL;

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // Group info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Members during creation
  const [members, setMembers] = useState([
    { name: "", email: "", phone: "" },
  ]);

  useEffect(() => {
    fetchGroups();
  }, []);

  /* ================= FETCH GROUPS ================= */
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setGroups([]);
        return;
      }

      const res = await fetch(`${API_BASE}/api/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // ✅ VERY IMPORTANT SAFETY CHECK
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        setGroups([]); // unauthorized or error response
      }
    } catch (err) {
      console.error("Fetch groups failed", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REFRESH SELECTED GROUP ================= */
  const refreshSelectedGroup = async () => {
    if (!selectedGroup) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/groups/${selectedGroup._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedGroup = await res.json();
      setSelectedGroup(updatedGroup);
    } catch (err) {
      console.error("Refresh group failed", err);
    }
  };

  /* ================= CREATE GROUP ================= */
const createGroup = async () => {
  if (!name.trim()) {
    alert("Group name required");
    return;
  }

  // Members are OPTIONAL — backend auto-adds creator
  const cleanMembers = members.filter(
    (m) => m.name || m.email || m.phone
  );

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
      members: cleanMembers, // can be empty []
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.message || "Failed to create group");
    return;
  }

  setName("");
  setDescription("");
  setMembers([{ name: "", email: "", phone: "" }]);
  fetchGroups();
};


  /* ================= MEMBER HANDLERS ================= */
  const updateMember = (i, field, value) => {
    const copy = [...members];
    copy[i][field] = value;
    setMembers(copy);
  };

  const addMember = () => {
    setMembers([...members, { name: "", email: "", phone: "" }]);
  };

  const removeMember = (i) => {
    const copy = [...members];
    copy.splice(i, 1);
    setMembers(copy);
  };

  if (loading) return <p>Loading groups...</p>;

  return (
    <div className="groups-layout">
      {/* LEFT */}
      <div className="groups-left">
        <div className="create-group-card">
          <h3>➕ Create New Group</h3>

          <input
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <h4>Members</h4>

          {members.map((m, i) => (
            <div key={i} className="member-row">
              <input
                placeholder="Name"
                value={m.name}
                onChange={(e) =>
                  updateMember(i, "name", e.target.value)
                }
              />
              <input
                placeholder="Email"
                value={m.email}
                onChange={(e) =>
                  updateMember(i, "email", e.target.value)
                }
              />
              <input
                placeholder="Phone"
                value={m.phone}
                onChange={(e) =>
                  updateMember(i, "phone", e.target.value)
                }
              />
              {members.length > 1 && (
                <button
                  className="icon-btn danger"
                  type="button"
                  onClick={() => removeMember(i)}
                >
                  ❌
                </button>
              )}
            </div>
          ))}

          <div className="create-group-actions">
            <button className="secondary-btn" type="button" onClick={addMember}>
              + Add Member
            </button>

            <button className="primary-btn" type="button" onClick={createGroup}>
              Create Group
            </button>
          </div>
        </div>

        <div className="groups-grid">
          {Array.isArray(groups) && groups.length === 0 && (
            <p>No groups created yet</p>
          )}

          {Array.isArray(groups) &&
            groups.map((g) => (
              <GroupCard
                key={g._id}
                group={g}
                onUpdated={fetchGroups}
                onSelect={() => setSelectedGroup(g)}
                isSelected={selectedGroup?._id === g._id}
              />
            ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="groups-right">
        {selectedGroup ? (
          <GroupDetails
            group={selectedGroup}
            refreshGroup={refreshSelectedGroup}
          />
        ) : (
          <p>Select a group to view details</p>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
