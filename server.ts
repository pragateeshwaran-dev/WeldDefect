import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDARDS_DATA = {
  ISO_17636_1: {
    name: "ISO 17636-1",
    focus: "Weld defect identification and characterization",
    criteria: {
      detection: "High sensitivity for weld zones",
      imageQuality: "Class A (Basic) and Class B (Improved) requirements",
      acceptance: "Based on ISO 5817 Level B for weld quality",
      technique: "X- and gamma-ray techniques with film",
      sensitivity: "Wire-type IQI required for sensitivity verification"
    }
  },
  ASME_VIII: {
    name: "ASME Section VIII",
    focus: "Pressure Vessels",
    criteria: {
      porosity: "Max 1/4 inch or 1/3 thickness",
      slag: "Max 1/3 thickness or 3/4 inch",
      cracks: "Strictly prohibited"
    }
  },
  AWS_D1_1: {
    name: "AWS D1.1",
    focus: "Structural Welding (Steel)",
    criteria: {
      undercut: "Max 0.01 inch for primary members",
      porosity: "Max 1/8 inch diameter",
      fusion: "Complete fusion required"
    }
  },
  DNV_ST_N001: {
    name: "DNV-ST-N001",
    focus: "Marine Operations",
    criteria: {
      fatigue: "High fatigue resistance required",
      defects: "Stricter limits for dynamic loading"
    }
  },
  REFERENCE_RESOURCES: {
    name: "Reference Training & Standards Data",
    url: "https://drive.google.com/drive/folders/1M_5GzkckXbEGgkzJgNBQqAtmB1oYkLDu",
    description: "External repository containing X-ray image analysis standards and reference datasets."
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API endpoint for standards
  app.get("/api/standards", (req, res) => {
    res.json(STANDARDS_DATA);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
