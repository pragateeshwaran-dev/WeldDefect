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
  ISO_17636_2: {
    name: "ISO 17636-2",
    focus: "Digital Radiography",
    criteria: {
      detector: "Digital detector array (DDA) or imaging plates (IP)",
      imageQuality: "SNR and CNR requirements",
      compensation: "Software-based image enhancement"
    }
  },
  ASME_SECTION_V: {
    name: "ASME Section V",
    focus: "Nondestructive Examination",
    criteria: {
      article_2: "Radiographic Examination requirements",
      density: "Optical density limits for film",
      iqi: "Hole-type or wire-type IQI selection"
    }
  },
  ASTM_E94: {
    name: "ASTM E94",
    focus: "Standard Guide for Radiographic Examination",
    criteria: {
      film_selection: "Selection of appropriate film types",
      processing: "Standardized chemical processing",
      viewing: "Illumination and viewing conditions"
    }
  },
  DNV_OS_C401: {
    name: "DNV-OS-C401",
    focus: "Fabrication and Testing of Offshore Structures",
    criteria: {
      marine_spec: "Specific requirements for maritime hull and structures",
      acceptance: "Stricter limits for dynamic loading zones",
      fatigue: "High fatigue resistance verification"
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
