import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Stack,
  Snackbar,
} from "@mui/material";

function power(base, expo, m) {
  base = BigInt(base);
  expo = BigInt(expo);
  m = BigInt(m);

  let res = 1n;
  base = base % m;

  while (expo > 0n) {
    if (expo & 1n) {
      res = (res * base) % m;
    }
    base = (base * base) % m;

    expo = BigInt(Math.floor(Number(expo) / 2));
  }
  return res;
}

function modInverse(e, phi) {
  e = BigInt(e);
  phi = BigInt(phi);

  for (let d = 2n; d < phi; d++) {
    if ((e * d) % phi === 1n) {
      return d;
    }
  }
  return -1n;
}

function gcd(a, b) {
  a = BigInt(a);
  b = BigInt(b);

  while (b !== 0n) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function isPrime(n) {
  n = BigInt(n);
  if (n < 2n) return false;

  for (let i = 2n; i * i <= n; i++) {
    if (n % i === 0n) return false;
  }
  return true;
}

export default function RSA_Encryption() {
  const [p, setP] = useState("");
  const [q, setQ] = useState("");
  const [M, setM] = useState("");
  const [pError, setPError] = useState("");
  const [qError, setQError] = useState("");
  const [mError, setMError] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleSnackClose = () => {
    setSnackOpen(false);
    setTimeout(200);
  };

  const computeRSA = () => {
    setResult(null);
    try {
      setWarnings([]);
      const warn = [];
      const pBig = BigInt(p);
      const qBig = BigInt(q);
      const MBig = BigInt(M);

      if (!isPrime(pBig)) warn.push(`p = ${p} is NOT a prime number.`);
      if (!isPrime(qBig)) warn.push(`q = ${q} is NOT a prime number.`);
      setWarnings(warn);

      const n = pBig * qBig;
      const phi = (pBig - 1n) * (qBig - 1n);

      let e = 2n;
      while (e < phi && gcd(e, phi) !== 1n) {
        e++;
      }

      const d = modInverse(e, phi);

      const encrypted = power(MBig, e, n);
      const decrypted = power(encrypted, d, n);

      setResult({
        n,
        phi,
        e,
        d,
        encrypted,
        decrypted,
      });
    } catch (err) {
      setSnackOpen(true);
      setSnackMessage("Error computing RSA. Check your inputs.");
      console.log(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mt: 5, mx: "auto", textAlign: "center", px: 2 }}>
      <Typography variant="h4" fontWeight="bold" color="black">
        RSA Calculator
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 500, mx: "auto" }}
      >
        To use calculator: Enter prime numbers for "p" and "q" otherwise
        calculator won't work properly, then enter a number for message "M".
        Press <b>CALCULATE RSA</b> to generate keys and see the encrypted and
        decrypted results.
      </Typography>

      {/* INPUTS */}
      <Stack spacing={2}>
        <TextField
          label="Prime p"
          fullWidth
          autoComplete="off"
          value={p}
          error={Boolean(pError)}
          helperText={pError}
          onChange={(e) => {
            const value = e.target.value;
            setP(value);

            if (value.trim() === "") setPError("p cannot be empty");
            else if (value === "0") setPError("p cannot be 0");
            else setPError("");
          }}
        />

        <TextField
          label="Prime q"
          fullWidth
          autoComplete="off"
          value={q}
          error={Boolean(qError)}
          helperText={qError}
          onChange={(e) => {
            const value = e.target.value;
            setQ(value);

            if (value.trim() === "") setQError("q cannot be empty");
            else if (value === "0") setQError("q cannot be 0");
            else setQError("");
          }}
        />

        <TextField
          label="Message M"
          fullWidth
          autoComplete="off"
          value={M}
          error={Boolean(mError)}
          helperText={mError}
          onChange={(e) => {
            const value = e.target.value;
            setM(value);

            if (value.trim() === "") setMError("Message cannot be empty");
            else if (value === "0") setMError("Message cannot be 0");
            else setMError("");
          }}
        />

        <Button
          variant="contained"
          size="large"
          disabled={pError || qError || mError || !p || !q || !M}
          onClick={computeRSA}
        >
          Calculate RSA
        </Button>
      </Stack>

      {/* PRIME WARNINGS */}
      {warnings.length > 0 && (
        <Box mt={3}>
          {warnings.map((w, i) => (
            <Alert severity="warning" sx={{ mb: 1 }} key={i}>
              {w}
            </Alert>
          ))}
        </Box>
      )}

      {/* RESULTS */}
      {result && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Results
          </Typography>

          <Typography>
            <b>n:</b> {result.n.toString()}
          </Typography>
          <Typography>
            <b>φ(n):</b> {result.phi.toString()}
          </Typography>
          <Typography mt={1}>
            <b>Public Key (e, n):</b> {result.e.toString()}
          </Typography>
          <Typography>
            <b>Private Key (d, n):</b> {result.d.toString()}
          </Typography>
          <Typography mt={1}>
            <b>Encrypted:</b> {result.encrypted.toString()}
          </Typography>
          <Typography>
            <b>Decrypted:</b> {result.decrypted.toString()}
          </Typography>
        </Paper>
      )}

      {/* SNACKBAR WARNING */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
