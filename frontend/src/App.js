import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Chargement...");

  useEffect(() => {
    fetch("http://localhost:8000/hello/")
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch(() => setMessage("Erreur de connexion"));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Frontend React</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default App;
