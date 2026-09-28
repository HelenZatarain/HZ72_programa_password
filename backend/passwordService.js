import { randomInt } from "node:crypto";

const COMMON_PASSWORDS = new Set([
  "123",
  "1234",
  "12345",
  "123456",
  "123456789",
  "password",
  "gato",
  "12345678",
  "abc123",
  "password1",
  "admin",
  "welcome",
  "letmein",
  "iloveyou",
  "monkey",
  "contraseña",
  "perro",
  "hola",
]);

const LEET = {
  a: "4",
  e: "3",
  i: "1",
  o: "0",
  s: "$",
  t: "7",
  l: "1",
  g: "9",
  b: "8",
};

const SYMBOLS = [
  "!",
  "#",
  "$",
  "%",
  "&",
  "*",
  "?",
  "@",
];

/* =========================================
   VALIDADORES
========================================= */

function hasUpper(value) {
  return /[A-ZÁÉÍÓÚÑ]/.test(value);
}

function hasLower(value) {
  return /[a-záéíóúñ]/.test(value);
}

function hasNumber(value) {
  return /\d/.test(value);
}

function hasSymbol(value) {
  return /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(
    value
  );
}

/* =========================================
   EVALUAR CONTRASEÑA
========================================= */

export function evaluatePassword(password) {

  const normalized =
    password.trim().toLowerCase();

  /*
    Los primeros cinco criterios
    se evalúan individualmente.
  */

  const length =
    password.length >= 12 &&
    !/\s/.test(password);

  const upper =
    hasUpper(password);

  const lower =
    hasLower(password);

  const numberSymbol =
    hasNumber(password) &&
    hasSymbol(password);

  const avoidObvious =
    !COMMON_PASSWORDS.has(normalized);

  /*
    El sexto criterio representa
    una combinación completa.

    Se considera cumplido cuando
    todos los criterios anteriores
    están satisfechos.
  */

  const phrase =
    length &&
    upper &&
    lower &&
    numberSymbol &&
    avoidObvious;

  const checks = {
    length,
    upper,
    lower,
    numberSymbol,
    avoidObvious,
    phrase,
  };

  const score =
    Object.values(checks)
      .filter(Boolean)
      .length;

  return {
    checks,

    tooCommon:
      COMMON_PASSWORDS.has(normalized),

    score,

    allValid:
      Object.values(checks)
        .every(Boolean),
  };
}

/* =========================================
   UTILIDADES DEL GENERADOR
========================================= */

function randomItem(array) {
  return array[
    randomInt(array.length)
  ];
}

function randomDigit() {
  return String(randomInt(10));
}

function randomUppercase() {
  const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return letters[
    randomInt(letters.length)
  ];
}

function randomLowercase() {
  const letters =
    "abcdefghijklmnopqrstuvwxyz";

  return letters[
    randomInt(letters.length)
  ];
}

/*
  Convierte las letras de la frase
  utilizando leetspeak.
*/

function leetTransform(value) {

  return value
    .split("")
    .map((character) => {

      const lower =
        character.toLowerCase();

      return (
        LEET[lower] ??
        character
      );

    })
    .join("");
}

/*
  Elimina todos los espacios
  y caracteres innecesarios.
*/

function cleanPhrase(phrase) {

  return phrase
    .trim()
    .replace(/\s+/g, "");
}

/*
  Convierte la primera letra
  en mayúscula para garantizar
  el requisito de uppercase.
*/

function ensureUppercase(value, position = 0) {

  if (hasUpper(value)) {
    return value;
  }

  const characters = value.split("");

  let letterPositions = [];

  for (let i = 0; i < characters.length; i++) {
    if (/[a-záéíóúñ]/i.test(characters[i])) {
      letterPositions.push(i);
    }
  }

  if (letterPositions.length === 0) {
    return randomUppercase() + value;
  }

  const selectedPosition =
    letterPositions[
      position % letterPositions.length
    ];

  characters[selectedPosition] =
    characters[selectedPosition].toUpperCase();

  return characters.join("");
}

function ensureLowercase(value) {

  if (hasLower(value)) {
    return value;
  }

  return (
    value +
    randomLowercase()
  );
}


function ensureNumber(value) {

  return (
    value +
    randomDigit()
  );
}

function ensureSymbol(value) {

  return (
    value +
    randomItem(SYMBOLS)
  );
}


function ensureMinimumLength(value) {

  let result = value;

  while (result.length < 12) {

    const options = [
      randomUppercase(),
      randomLowercase(),
      randomDigit(),
      randomItem(SYMBOLS),
    ];

    result += randomItem(options);
  }

  return result;
}

function shuffle(value) {

  const characters =
    value.split("");

  for (
    let i = characters.length - 1;
    i > 0;
    i--
  ) {

    const j =
      randomInt(i + 1);

    [
      characters[i],
      characters[j],
    ] = [
      characters[j],
      characters[i],
    ];
  }

  return characters.join("");
}

/* =========================================
   CREAR UNA CONTRASEÑA SEGURA
========================================= */

function createSecurePassword(
  phrase,
  variation
) {

  const cleaned =
    cleanPhrase(phrase);

  let password =
    leetTransform(cleaned);

  password =
    ensureUppercase(
      password,
      variation
    );

  password =
    ensureLowercase(password);

  password =
    ensureNumber(password);

  password =
    ensureSymbol(password);

  password =
    ensureMinimumLength(password);


  return password;
}

/* ===================================
   GENERAR 3 VARIANTES
========================================= */

export function buildPasswordVariants(
  phrase
) {

  const cleaned =
    cleanPhrase(phrase);

  if (!cleaned) {
    return [];
  }

  const variants = [];

  for (let i = 0; i < 3; i++) {

    let password =
      createSecurePassword(
        cleaned,
        i
      );

    let evaluation =
      evaluatePassword(password);


    let attempts = 0;

    while (
      !evaluation.allValid &&
      attempts < 10
    ) {

      password =
        createSecurePassword(
          cleaned,
          i
        );

      evaluation =
        evaluatePassword(password);

      attempts++;
    }

    variants.push(password);
  }

  return variants;
}