"use client";
import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";

export default function ManualCardSection({ userId, usdBalance }: { userId: string, usdBalance: number }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setStatus(null);
    setLoading(true);
    if (usdBalance < 1000) {
      setStatus("Insufficient balance. You need at least $1,000 to request a card.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/card-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setStatus("Request submitted! Await admin approval.");
      } else {
        setStatus("Failed to submit request. Please try again later.");
      }
    } catch {
      setStatus("Network error. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <Box>
      {/* Flip Card Preview (SVG front/back) */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <FlipCard />
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>How to get your card:</b>
        </Typography>
        <ol style={{ paddingLeft: 20 }}>
          <li>Ensure you have at least <b>$1,000</b> available in your USD balance.</li>
          <li>Click the button below to request your card.</li>
          <li>Your request will be reviewed by an admin. If approved, you’ll receive further instructions by email.</li>
        </ol>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleRequest} disabled={loading}>
            {loading ? "Submitting..." : "Request Card"}
          </Button>
          {status && <Typography color={status.startsWith("Request") ? "primary" : "error"} sx={{ mt: 1 }}>{status}</Typography>}
        </Box>
      </Box>
    </Box>
  );
}

function FlipCard() {
  const [flipped, setFlipped] = useState(false)
  return (
    <Box className="flip-card-container"
      sx={{
        perspective: '1000px',
        width: '100%',
        maxWidth: 480,
      }}
    >
      <Box
        role="button"
        aria-label="Flip card"
        onClick={() => setFlipped(v => !v)}
        sx={{
          width: '100%',
          aspectRatio: '480 / 300',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1)',
          cursor: 'pointer',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          '&:hover': { transform: 'rotateY(180deg)' }
        }}
      >
        {/* Front */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.35)'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="100%" height="100%">
            <defs>
              <linearGradient id="chipGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFD700"/>
                <stop offset="100%" stopColor="#B8860B"/>
              </linearGradient>
              <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.6"/>
                <stop offset="40%" stopColor="white" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect width="480" height="300" rx="20" fill="#0A1D3B"/>
            <rect width="480" height="300" rx="20" fill="url(#gloss)"/>
            <text x="20" y="40" fill="white" fontSize="22" fontFamily="Arial" fontWeight="bold">WILLIAMS HOLDINGS</text>
            <text x="20" y="65" fill="white" fontSize="18" fontFamily="Arial">Banking</text>
            <text x="260" y="40" fill="white" fontSize="22" fontFamily="Arial" fontWeight="bold">BANK OF AMERICA</text>
            <g transform="translate(30,90)">
              <rect width="60" height="50" rx="6" fill="url(#chipGradient)" stroke="black" strokeWidth="1.5"/>
              <line x1="10" y1="0" x2="10" y2="50" stroke="black" strokeWidth="1"/>
              <line x1="30" y1="0" x2="30" y2="50" stroke="black" strokeWidth="1"/>
              <line x1="50" y1="0" x2="50" y2="50" stroke="black" strokeWidth="1"/>
              <line x1="0" y1="15" x2="60" y2="15" stroke="black" strokeWidth="1"/>
              <line x1="0" y1="35" x2="60" y2="35" stroke="black" strokeWidth="1"/>
            </g>
            <path d="M110 95 q15 15 0 30 M120 90 q25 25 0 50 M130 85 q35 35 0 70" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <text x="30" y="180" fill="white" fontSize="22" fontFamily="Courier New">4000 1234 5678 9010</text>
            <text x="30" y="210" fill="white" fontSize="14" fontFamily="Arial">VALID THRU 12/27</text>
            <text x="30" y="240" fill="white" fontSize="18" fontFamily="Arial">JOHN</text>
            <text x="370" y="270" fill="white" fontSize="28" fontFamily="Arial" fontWeight="bold">VISA</text>
          </svg>
        </Box>

        {/* Back */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          borderRadius: '20px', overflow: 'hidden',
          transform: 'rotateY(180deg)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.35)'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="100%" height="100%">
            <rect width="480" height="300" rx="20" fill="#0A1D3B"/>
            <rect x="0" y="40" width="480" height="60" fill="black"/>
            <rect x="30" y="130" width="420" height="50" fill="white"/>
            <text x="400" y="160" fill="black" fontSize="22" fontFamily="Courier New">123</text>
            <text x="30" y="220" fill="white" fontSize="16" fontFamily="Arial">AUTHORIZED SIGNATURE</text>
            <text x="30" y="250" fill="white" fontSize="16" fontFamily="Arial">www.williamsbank.com</text>
          </svg>
        </Box>
      </Box>
    </Box>
  )
}
