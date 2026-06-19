// // import { createContext, useContext, useState, useEffect } from "react";

// // const AuthContext = createContext(null);

// // const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// // export function AuthProvider({ children }) {
// //   const [user,  setUser]  = useState(null);
// //   const [token, setToken] = useState(() => localStorage.getItem("cs_token"));

// //   // Restore session on mount
// //   useEffect(() => {
// //     const stored = localStorage.getItem("cs_user");
// //     if (stored && token) setUser(JSON.parse(stored));
// //   }, []);

// //   const login = async (username, password) => {
// //     const res = await fetch(`${BASE}/api/auth/login`, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ username, password }),
// //     });
// //     if (!res.ok) {
// //       const err = await res.json();
// //       throw new Error(err.error || "Login failed");
// //     }
// //     const data = await res.json();
// //     setToken(data.token);
// //     setUser({ username: data.username, role: data.role });
// //     localStorage.setItem("cs_token", data.token);
// //     localStorage.setItem("cs_user", JSON.stringify({ username: data.username, role: data.role }));
// //     return data;
// //   };

// //   const logout = () => {
// //     setToken(null);
// //     setUser(null);
// //     localStorage.removeItem("cs_token");
// //     localStorage.removeItem("cs_user");
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, token, login, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// // export const useAuth = () => useContext(AuthContext);


// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext(null);
// const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// export function AuthProvider({ children }) {
//   const [user,  setUser]  = useState(null);
//   const [token, setToken] = useState(() => localStorage.getItem("cs_token"));

//   useEffect(() => {
//     const stored = localStorage.getItem("cs_user");
//     if (stored && token) setUser(JSON.parse(stored));
//   }, []);

//   const login = async (username, password) => {
//     const res = await fetch(`${BASE}/api/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//     });
//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.error || "Login failed");
//     }
//     const data = await res.json();
//     setToken(data.token);
//     setUser({ username: data.username, role: data.role });
//     localStorage.setItem("cs_token",  data.token);
//     localStorage.setItem("cs_user",   JSON.stringify({ username: data.username, role: data.role }));
//     return data;
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem("cs_token");
//     localStorage.removeItem("cs_user");
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("cs_token"));

  useEffect(() => {
    const stored = localStorage.getItem("cs_user");
    if (stored && token) setUser(JSON.parse(stored));
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    setToken(data.token);
    setUser({ username: data.username, role: data.role, full_name: data.full_name });
    localStorage.setItem("cs_token",  data.token);
    localStorage.setItem("cs_user",   JSON.stringify({ username: data.username, role: data.role, full_name: data.full_name }));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);