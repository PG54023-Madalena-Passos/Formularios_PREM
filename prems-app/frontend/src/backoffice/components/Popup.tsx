import React, { useState, useEffect } from "react";

interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  hour: string;
  minutes: string;
  envio: string;
  reforco: string;
  sucesso: string;
}

interface UserForm {
  email: string;
  password: string;
}

const EmailPopup: React.FC<EmailPopupProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings>({
    hour: "",
    minutes: "",
    envio: "",
    reforco: "",
    sucesso: "",
  });

  const [userForm, setUserForm] = useState<UserForm>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // ✅ Novo state

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:5000/api/settings")
        .then((res) => res.json())
        .then((data) => {
          setSettings({
            hour: data.hour || "",
            minutes: data.minutes || "",
            envio: data.envio || "",
            reforco: data.reforco || "",
            sucesso: data.sucesso || "",
          });
        })
        .catch((err) => console.error("Erro a carregar settings:", err));
    }
  }, [isOpen]);

  const handleSettingsChange = (field: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserFormChange = (field: keyof UserForm, value: string) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  // 🚀 Criar utilizador
  const handleAddUser = async () => {
    if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      setError("Email inválido.");
      setSuccessMessage(null);
      return;
    }
    setError(null);

    const res = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userForm, role: "0" }),
    });

    if (res.ok) {
      setUserForm({ email: "", password: "" });
      setSuccessMessage("✅ Utilizador criado com sucesso!");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao criar utilizador");
      setSuccessMessage(null);
    }
  };

  // 🚀 Guardar alterações
  const handleSave = async () => {
  const res = await fetch("http://localhost:5000/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (res.ok) {
    setSuccessMessage("✅ Configurações guardadas com sucesso!");

    // 🚀 Atualiza o cron imediatamente
    await fetch("http://localhost:5000/api/cron/update-cron", {
      method: "POST",
    });

  } else {
    setError("Erro ao guardar configurações");
    setSuccessMessage(null);
  }
};

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <button onClick={onClose} style={styles.closeButton}>✕</button>
        <h2 style={styles.title}>Envio de Emails</h2>

        {/* Horário */}
        <div style={styles.section}>
          <label>Horário diário:</label>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              value={settings.hour}
              onChange={(e) => handleSettingsChange("hour", e.target.value)}
              style={styles.select}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i.toString().padStart(2, "0")}>
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            :
            <select
              value={settings.minutes}
              onChange={(e) => handleSettingsChange("minutes", e.target.value)}
              style={styles.select}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i.toString().padStart(2, "0")}>
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates */}
        <div style={styles.section}>
          <label>Envio</label>
          <textarea
            value={settings.envio}
            onChange={(e) => handleSettingsChange("envio", e.target.value)}
            style={styles.textarea}
          />
        </div>
        <div style={styles.section}>
          <label>Reforço</label>
          <textarea
            value={settings.reforco}
            onChange={(e) => handleSettingsChange("reforco", e.target.value)}
            style={styles.textarea}
          />
        </div>
        <div style={styles.section}>
          <label>Sucesso</label>
          <textarea
            value={settings.sucesso}
            onChange={(e) => handleSettingsChange("sucesso", e.target.value)}
            style={styles.textarea}
          />
        </div>

        {/* Botão Guardar */}
        <button onClick={handleSave} style={styles.saveButton}>Guardar</button>
        {successMessage && <div style={styles.successText}>{successMessage}</div>}

        {/* Criar Utilizador */}
        <div style={{ ...styles.section, borderTop: "1px solid #ddd", paddingTop: "1rem" }}>
          <h2 style={styles.title}>Criar Utilizador</h2>
          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) => handleUserFormChange("email", e.target.value)}
            style={styles.input}
          />
          {error && <div style={styles.errorText}>{error}</div>}
          <input
            type="password"
            placeholder="Password"
            value={userForm.password}
            onChange={(e) => handleUserFormChange("password", e.target.value)}
            style={{ ...styles.input, marginTop: "0.5rem" }}
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
            <button onClick={handleAddUser} style={styles.addButton}>Adicionar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPopup;

// --- estilos
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    zIndex: 50
  },
  popup: {
    backgroundColor: "#f9f9f9",
    borderRadius: "24px",
    border: "2px solid #333",
    padding: "2rem",
    maxWidth: "500px",
    width: "100%",
    position: "relative"
  },
  closeButton: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    fontSize: "1.5rem",
    cursor: "pointer",
    border: "none",
    background: "none"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem"
  },
  section: { marginBottom: "1.5rem" },
  select: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #333",
    outline: "none",
    cursor: "pointer"
  },
  textarea: {
    width: "100%",
    height: "60px",
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #333",
    outline: "none",
    resize: "vertical"
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #333",
    fontSize: "1rem",
    outline: "none"
  },
  errorText: { color: "red", fontSize: "0.75rem", marginTop: "0.2rem" },
  successText: { color: "green", fontSize: "0.85rem", marginTop: "0.5rem", fontWeight: 500 },
  addButton: {
    width: "50%",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer"
  },
  saveButton: {
    marginTop: "0.5rem",
    marginBottom: "1rem",
    width: "100%",
    padding: "0.75rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer"
  },
};
