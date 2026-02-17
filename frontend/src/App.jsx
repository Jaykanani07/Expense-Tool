// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./components/LoginPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import GroupViewPage from "./pages/GroupViewPage.jsx";

import "./components/styles.css";

console.log("APP MOUNTED");

const App = () => {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(20000);
  const [profile, setProfile] = useState(null);
  const [recurringExpenses, setRecurringExpenses] = useState([]);

  const getUserScopeKey = (u) => {
    if (!u) return null;
    return u._id || u.id || u.email;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("emt_theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.documentElement.setAttribute(
      "data-theme",
      prefersDark ? "dark" : "light"
    );
  }, []);

  /* ================= RESTORE USER (ONCE) ================= */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Restore user data immediately after setting user
      const scope = getUserScopeKey(userData);
      if (scope) {
        const savedExpenses = localStorage.getItem(`emt_expenses_${scope}`);
        const savedBudget = localStorage.getItem(`emt_budget_${scope}`);
        const savedProfile = localStorage.getItem(`emt_profile_${scope}`);
        const savedRecurring = localStorage.getItem(`emt_recurring_${scope}`);

        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
        setBudget(savedBudget ? Number(savedBudget) : 20000);
        setProfile(savedProfile ? JSON.parse(savedProfile) : null);
        setRecurringExpenses(savedRecurring ? JSON.parse(savedRecurring) : []);
      }
    }
  }, []);

  /* ================= LOGIN ================= */
  const handleLogin = (userData) => {
    console.log("Login callback triggered with user:", userData);
    
    if (!userData || !userData.email) {
      console.error("Invalid user data received:", userData);
      alert("Login failed: Invalid user data received");
      return;
    }

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Initialize user data when logging in
    const scope = getUserScopeKey(userData);
    if (scope) {
      const savedExpenses = localStorage.getItem(`emt_expenses_${scope}`);
      const savedBudget = localStorage.getItem(`emt_budget_${scope}`);
      const savedProfile = localStorage.getItem(`emt_profile_${scope}`);
      const savedRecurring = localStorage.getItem(`emt_recurring_${scope}`);

      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      setBudget(savedBudget ? Number(savedBudget) : 20000);
      setProfile(savedProfile ? JSON.parse(savedProfile) : null);
      setRecurringExpenses(savedRecurring ? JSON.parse(savedRecurring) : []);
    }
    
    console.log("Login successful, user state updated");
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    setUser(null);
    setExpenses([]);
    setBudget(20000);
    setProfile(null);
    setRecurringExpenses([]);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const scope = getUserScopeKey(user);
    if (!scope) return;
    localStorage.setItem(`emt_expenses_${scope}`, JSON.stringify(expenses));
  }, [expenses, user]);

  useEffect(() => {
    const scope = getUserScopeKey(user);
    if (!scope) return;
    localStorage.setItem(`emt_recurring_${scope}`, JSON.stringify(recurringExpenses));
  }, [recurringExpenses, user]);

  useEffect(() => {
    const scope = getUserScopeKey(user);
    if (!scope) return;
    localStorage.setItem(`emt_budget_${scope}`, String(budget));
  }, [budget, user]);

  useEffect(() => {
    const scope = getUserScopeKey(user);
    if (!scope) return;

    if (!profile) {
      localStorage.removeItem(`emt_profile_${scope}`);
      return;
    }

    localStorage.setItem(`emt_profile_${scope}`, JSON.stringify(profile));
  }, [profile, user]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 Public read-only page (NO LOGIN REQUIRED) */}
        <Route path="/group-view/:token" element={<GroupViewPage />} />

        {/* 🔐 Main App */}
        <Route
          path="/*"
          element={
            user ? (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                expenses={expenses}
                setExpenses={setExpenses}
                budget={budget}
                setBudget={setBudget}
                profile={profile}
                setProfile={setProfile}
                recurringExpenses={recurringExpenses}
                setRecurringExpenses={setRecurringExpenses}
              />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
