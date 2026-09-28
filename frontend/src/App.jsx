import { useEffect, useState } from "react";

const API_URL = "/api";

const checks = [
    {
        key: "length",
        title: "Longitud",
        description: "12 o más caracteres",
    },
    {
        key: "upper",
        title: "Mayúsculas",
        description: "Incluye letras mayúsculas",
    },
    {
        key: "lower",
        title: "Minúsculas",
        description: "Incluye letras minúsculas",
    },
        {
        key: "numberSymbol",
        title: "Números y símbolos",
        description: "Combina números y caracteres especiales",
    },
    {
        key: "avoidObvious",
        title: "Evita lo obvio",
        description: "Sin palabras comunes o información personal",
    },
    {
        key: "phrase",
        title: "Frase secreta",
        description: "Integra los elementos necesarios",
    },
];

function StatusIndicator({ valid }) {
  return (
    <span className={`status-indicator ${valid ? "valid" : ""}`}>
      {valid ? "✓" : "×"}
    </span>
  );
}

function SecurityMood({ evaluation }) {
  const score = evaluation
    ? Object.values(evaluation.checks).filter(Boolean).length
    : 0;

  const percentage = Math.round((score / checks.length) * 100);

  let message = "Todavía muy vulnerable";

  if (score === 2) {
    message = "Va tomando forma";
  } else if (score === 3) {
    message = "Cada vez mejor";
  } else if (score === 4) {
    message = "Bastante segura";
  } else if (score === 5) {
    message = "Casi perfecta";
  } else if (score === 6) {
    message = "Contraseña protegida";
  }

  return (
    <div className="security-mood">
      <div className="mood-top">
        <div>
          <span className="mini-label">
            SECURITY STATUS
          </span>

          <h3>{message}</h3>
        </div>

        <div className="score">
          <strong>{score}</strong>
          <span>/6</span>
        </div>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="progress-labels">
        <span>vulnerable</span>
        <span>protected</span>
      </div>
    </div>
  );
}

function Validator() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!password) {
      setEvaluation(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/password/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "No se pudo validar la contraseña."
          );
        }

        const data = await response.json();

        setEvaluation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [password]);

  return (
    <section className="panel validator-panel">

      <div className="panel-header">

        <div>
          <span className="section-number">
            01
          </span>

          <h2>Password Validator</h2>

          <p>
            Construye una contraseña y observa cómo
            cambia su nivel de seguridad.
          </p>
        </div>

        <div className="header-orbit">
          <span />
          <span />
          <span />
        </div>

      </div>

      <div className="password-input-wrapper">

        <span className="input-prefix">
          &gt;
        </span>

        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => {
            const value = e.target.value.replace(/\s/g, "");
            setPassword(value);
            }}
          placeholder="Escribe tu contraseña..."
        />

        <button
          className="show-button"
          type="button"
          onClick={() =>
            setShowPassword(!showPassword)
          }
        >
          {showPassword ? "ocultar" : "mostrar"}
        </button>

      </div>

      {loading && (
        <div className="checking">
          analizando...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <SecurityMood
        evaluation={evaluation}
      />

      <div className="checks-grid">

        {checks.map((check, index) => {

          const valid =
            evaluation?.checks?.[check.key] ?? false;

          return (
            <div
              className={`check-card ${
                valid ? "completed" : ""
              }`}
              key={check.key}
            >

              <div className="check-number">
                0{index + 1}
              </div>

              <StatusIndicator
                valid={valid}
              />

              <div className="check-content">

                <h3>{check.title}</h3>

                <p>
                  {check.description}
                </p>

              </div>

              <div className="check-dot" />

            </div>
          );
        })}

      </div>

      {evaluation?.tooCommon && (
        <div className="warning-box">

          <span className="warning-dot" />

          <div>

            <strong>
              Contraseña demasiado común
            </strong>

            <p>
              Esta contraseña aparece en una
              lista de contraseñas frecuentes.
              Intenta crear una combinación
              más original.
            </p>

          </div>

        </div>
      )}

    </section>
  );
}

function Generator() {

  const [phrase, setPhrase] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [copiedIndex, setCopiedIndex] =
    useState(null);

  async function generatePasswords() {

    if (!phrase.trim()) {
      setError(
        "Escribe una frase para generar tus contraseñas."
      );

      return;
    }

    try {

      setLoading(true);
      setError("");
      setCopiedIndex(null);

      const response = await fetch(
        `${API_URL}/password/generate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phrase,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudieron generar las contraseñas."
        );
      }

      const data = await response.json();

      setResults(data.variants || []);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  }

  async function copyPassword(
    password,
    index
  ) {

    try {

      await navigator.clipboard.writeText(
        password
      );

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);

    } catch {

      setError(
        "No se pudo copiar la contraseña."
      );

    }
  }

  return (
    <section className="panel generator-panel">

      <div className="panel-header">

        <div>

          <span className="section-number">
            02
          </span>

          <h2>Password Generator</h2>

          <p>
            Introduce una frase y crea tres
            variantes utilizando leetspeak.
          </p>

        </div>

        <div className="generator-symbol">

          <div />
          <div />
          <div />

        </div>

      </div>

      <div className="generator-form">

        <label htmlFor="phrase">
          YOUR SECRET PHRASE
        </label>

        <div className="phrase-row">

          <input
            id="phrase"
            type="text"
            value={phrase}
            onChange={(e) =>
              setPhrase(e.target.value)
            }
            placeholder="ej. luna sobre el mar"
          />

          <button
            className="generate-button"
            onClick={generatePasswords}
            disabled={loading}
          >
            {loading
              ? "generando..."
              : "generar"}
          </button>

        </div>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {results.length > 0 && (

        <div className="results">

          <div className="results-title">

            <span />

            <p>
              GENERATED VARIANTS
            </p>

            <span />

          </div>

          {results.map(
            (password, index) => (

              <div
                className="result-card"
                key={index}
              >

                <div className="variant-number">
                  0{index + 1}
                </div>

                <code>
                  {password}
                </code>

                <button
                  className="copy-button"
                  onClick={() =>
                    copyPassword(
                      password,
                      index
                    )
                  }
                >
                  {copiedIndex === index
                    ? "copiado"
                    : "copiar"}
                </button>

              </div>

            )
          )}

        </div>

      )}

    </section>
  );
}

export default function App() {

  return (
    <main className="app">

      <div className="background-circle circle-one" />

      <div className="background-circle circle-two" />

      <div className="background-circle circle-three" />

      <header className="hero">

        <div className="hero-decoration left">
          <span />
          <span />
          <span />
        </div>

        <div className="hero-content">

          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>

          <h1>
            Programa de contraseñas seguras
          </h1>
        </div>

        <div className="hero-decoration right">
          <span />
          <span />
          <span />
        </div>

      </header>

      <div className="main-content">

        <Validator />

        <Generator />

      </div>

      <footer>

        <span>
          Programa de contraseñas seguras
        </span>

        <span className="footer-line" />

        <span>
          2026
        </span>

      </footer>

    </main>
  );
}