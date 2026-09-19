/**
 * Visual Diagram & Image Assets for AI Study Companion
 *
 * Generates vector-sharp SVG data URLs for machine learning architectures,
 * loss contours, attention mechanisms, and performance matrices.
 */

export function createSvgDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const SAMPLE_DIAGRAMS = {
  neuralNetwork: {
    fileName: "Neural_Network_Architecture_Flowchart.png",
    title: "Deep Neural Network Architecture",
    description: "Multilayer perceptron with input tensor, hidden feature representations, activation units, and softmax output.",
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background:#0f172a;font-family:system-ui,-apple-system,sans-serif;">
        <defs>
          <linearGradient id="gradInput" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
          <linearGradient id="gradHidden" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#a855f7"/>
            <stop offset="100%" stop-color="#7e22ce"/>
          </linearGradient>
          <linearGradient id="gradOutput" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#15803d"/>
          </linearGradient>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b"/>
          </marker>
        </defs>

        <!-- Background grid -->
        <g stroke="#1e293b" stroke-width="1" opacity="0.6">
          <line x1="0" y1="90" x2="800" y2="90"/>
          <line x1="0" y1="180" x2="800" y2="180"/>
          <line x1="0" y1="270" x2="800" y2="270"/>
          <line x1="0" y1="360" x2="800" y2="360"/>
          <line x1="160" y1="0" x2="160" y2="450"/>
          <line x1="320" y1="0" x2="320" y2="450"/>
          <line x1="480" y1="0" x2="480" y2="450"/>
          <line x1="640" y1="0" x2="640" y2="450"/>
        </g>

        <!-- Diagram Header -->
        <rect x="20" y="16" width="760" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="40" y="42" fill="#f8fafc" font-size="15" font-weight="700" letter-spacing="0.5">FIGURE 1.1: FEEDFORWARD MULTI-LAYER NEURAL NETWORK</text>
        <text x="620" y="42" fill="#38bdf8" font-size="12" font-weight="600">INPUT → DENSE → SOFTMAX</text>

        <!-- Connections (Input to Hidden 1) -->
        <g stroke="#475569" stroke-width="1.2" opacity="0.5">
          <line x1="120" y1="150" x2="300" y2="130"/>
          <line x1="120" y1="150" x2="300" y2="190"/>
          <line x1="120" y1="150" x2="300" y2="250"/>
          <line x1="120" y1="150" x2="300" y2="310"/>

          <line x1="120" y1="230" x2="300" y2="130"/>
          <line x1="120" y1="230" x2="300" y2="190"/>
          <line x1="120" y1="230" x2="300" y2="250"/>
          <line x1="120" y1="230" x2="300" y2="310"/>

          <line x1="120" y1="310" x2="300" y2="130"/>
          <line x1="120" y1="310" x2="300" y2="190"/>
          <line x1="120" y1="310" x2="300" y2="250"/>
          <line x1="120" y1="310" x2="300" y2="310"/>

          <!-- Hidden 1 to Hidden 2 -->
          <line x1="300" y1="130" x2="480" y2="150"/>
          <line x1="300" y1="130" x2="480" y2="230"/>
          <line x1="300" y1="130" x2="480" y2="310"/>

          <line x1="300" y1="190" x2="480" y2="150"/>
          <line x1="300" y1="190" x2="480" y2="230"/>
          <line x1="300" y1="190" x2="480" y2="310"/>

          <line x1="300" y1="250" x2="480" y2="150"/>
          <line x1="300" y1="250" x2="480" y2="230"/>
          <line x1="300" y1="250" x2="480" y2="310"/>

          <line x1="300" y1="310" x2="480" y2="150"/>
          <line x1="300" y1="310" x2="480" y2="230"/>
          <line x1="300" y1="310" x2="480" y2="310"/>

          <!-- Hidden 2 to Output -->
          <line x1="480" y1="150" x2="660" y2="190" marker-end="url(#arrow)"/>
          <line x1="480" y1="150" x2="660" y2="270" marker-end="url(#arrow)"/>
          <line x1="480" y1="230" x2="660" y2="190" marker-end="url(#arrow)"/>
          <line x1="480" y1="230" x2="660" y2="270" marker-end="url(#arrow)"/>
          <line x1="480" y1="310" x2="660" y2="190" marker-end="url(#arrow)"/>
          <line x1="480" y1="310" x2="660" y2="270" marker-end="url(#arrow)"/>
        </g>

        <!-- Input Layer Column -->
        <g>
          <text x="120" y="100" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">INPUT LAYER (X)</text>
          <circle cx="120" cy="150" r="22" fill="url(#gradInput)" stroke="#e2e8f0" stroke-width="2"/>
          <text x="120" y="155" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">x₁</text>

          <circle cx="120" cy="230" r="22" fill="url(#gradInput)" stroke="#e2e8f0" stroke-width="2"/>
          <text x="120" y="235" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">x₂</text>

          <circle cx="120" cy="310" r="22" fill="url(#gradInput)" stroke="#e2e8f0" stroke-width="2"/>
          <text x="120" y="315" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">xₙ</text>
        </g>

        <!-- Hidden Layer 1 Column -->
        <g>
          <text x="300" y="100" fill="#c084fc" font-size="12" font-weight="600" text-anchor="middle">HIDDEN LAYER 1 (h₁)</text>
          <circle cx="300" cy="130" r="20" fill="url(#gradHidden)" stroke="#f3e8ff" stroke-width="1.5"/>
          <text x="300" y="135" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">a₁¹</text>

          <circle cx="300" cy="190" r="20" fill="url(#gradHidden)" stroke="#f3e8ff" stroke-width="1.5"/>
          <text x="300" y="195" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">a₂¹</text>

          <circle cx="300" cy="250" r="20" fill="url(#gradHidden)" stroke="#f3e8ff" stroke-width="1.5"/>
          <text x="300" y="255" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">a₃¹</text>

          <circle cx="300" cy="310" r="20" fill="url(#gradHidden)" stroke="#f3e8ff" stroke-width="1.5"/>
          <text x="300" y="315" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">a₄¹</text>
        </g>

        <!-- Hidden Layer 2 Column -->
        <g>
          <text x="480" y="100" fill="#c084fc" font-size="12" font-weight="600" text-anchor="middle">HIDDEN LAYER 2 (h₂)</text>
          <circle cx="480" cy="150" r="20" fill="url(#gradHidden)" stroke="#f3e8ff" stroke-width="1.5"/>
          <text x="480" y="155" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">a₁²</text>

          <circle cx="480" cy="230" r="20" fill="url(#gradHidden)" stroke="#f3e8ff" stroke-width="1.5"/>
          <text x="480" y="235" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">a₂²</text>

          <circle cx="480" cy="310" r="20" fill="url(#gradHidden)" stroke="#f3e8ff" stroke-width="1.5"/>
          <text x="480" y="315" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">a₃²</text>
        </g>

        <!-- Output Layer Column -->
        <g>
          <text x="660" y="100" fill="#4ade80" font-size="12" font-weight="600" text-anchor="middle">OUTPUT LAYER (ŷ)</text>
          <circle cx="660" cy="190" r="24" fill="url(#gradOutput)" stroke="#dcfce7" stroke-width="2"/>
          <text x="660" y="195" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">ŷ₁</text>

          <circle cx="660" cy="270" r="24" fill="url(#gradOutput)" stroke="#dcfce7" stroke-width="2"/>
          <text x="660" y="275" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">ŷ₂</text>
        </g>

        <!-- Bottom Legend & Mathematical Annotations -->
        <rect x="40" y="380" width="720" height="52" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="60" y="405" fill="#38bdf8" font-size="11" font-weight="700">FORWARD PROPAGATION:</text>
        <text x="210" y="405" fill="#94a3b8" font-size="11">z^[l] = W^[l] · a^[l-1] + b^[l]  |  a^[l] = σ(z^[l])</text>
        <text x="60" y="422" fill="#ef4444" font-size="11" font-weight="700">LOSS OBJECTIVE:</text>
        <text x="175" y="422" fill="#94a3b8" font-size="11">ℒ(y, ŷ) = - Σ yᵢ log(ŷᵢ) (Categorical Cross-Entropy with Softmax)</text>
      </svg>
    `),
  },

  gradientDescent: {
    fileName: "Gradient_Descent_Loss_Surface_Contour.png",
    title: "Gradient Descent Optimization Surface",
    description: "Loss landscape contours showing learning rate steps, oscillations, momentum vector, and global minimum convergence.",
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background:#0f172a;font-family:system-ui,-apple-system,sans-serif;">
        <!-- Header -->
        <rect x="20" y="16" width="760" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="40" y="42" fill="#f8fafc" font-size="15" font-weight="700">FIGURE 2.3: LOSS SURFACE CONTOURS &amp; GRADIENT TRAJECTORIES</text>
        <text x="590" y="42" fill="#f59e0b" font-size="12" font-weight="600">PARAMETER SPACE (θ₁, θ₂)</text>

        <!-- Elliptical Contours -->
        <g stroke="#334155" fill="none" stroke-width="1.5">
          <ellipse cx="400" cy="230" rx="340" ry="150"/>
          <ellipse cx="400" cy="230" rx="280" ry="120" stroke="#475569"/>
          <ellipse cx="400" cy="230" rx="220" ry="90" stroke="#64748b"/>
          <ellipse cx="400" cy="230" rx="160" ry="65" stroke="#0284c7"/>
          <ellipse cx="400" cy="230" rx="100" ry="40" stroke="#38bdf8"/>
          <ellipse cx="400" cy="230" rx="45" ry="18" stroke="#4ade80" stroke-width="2"/>
        </g>

        <!-- Global Minimum Marker -->
        <circle cx="400" cy="230" r="5" fill="#22c55e"/>
        <text x="415" y="235" fill="#4ade80" font-size="12" font-weight="700">GLOBAL MINIMUM θ*</text>

        <!-- Gradient Descent Trajectory (Vanilla GD - orange) -->
        <g stroke="#f97316" stroke-width="2.5" fill="none">
          <polyline points="150,130 220,290 280,180 330,260 365,215 385,238 398,230" />
        </g>
        <!-- Steps dots -->
        <circle cx="150" cy="130" r="5" fill="#f97316"/>
        <text x="140" y="115" fill="#fdba74" font-size="11" font-weight="700">θ₀ (Initial)</text>
        <circle cx="220" cy="290" r="4" fill="#f97316"/>
        <circle cx="280" cy="180" r="4" fill="#f97316"/>
        <circle cx="330" cy="260" r="4" fill="#f97316"/>
        <circle cx="365" cy="215" r="3.5" fill="#f97316"/>
        <circle cx="385" cy="238" r="3" fill="#f97316"/>

        <!-- Momentum Trajectory (smooth green) -->
        <g stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="5 3" fill="none">
          <path d="M 150,130 Q 260,200 320,225 T 398,230" />
        </g>
        <circle cx="320" cy="225" r="4" fill="#38bdf8"/>
        <text x="280" y="215" fill="#7dd3fc" font-size="11" font-weight="700">Momentum Path (β=0.9)</text>

        <!-- Mathematical Box -->
        <rect x="40" y="375" width="720" height="55" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="60" y="400" fill="#f97316" font-size="11" font-weight="700">STANDARD GD STEP:</text>
        <text x="195" y="400" fill="#cbd5e1" font-size="11">θ_(t+1) = θ_t - η ∇L(θ_t) (Shows zig-zag in ravines with high conditioning number)</text>
        <text x="60" y="418" fill="#38bdf8" font-size="11" font-weight="700">MOMENTUM ACCELERATION:</text>
        <text x="240" y="418" fill="#cbd5e1" font-size="11">v_t = β v_(t-1) + (1-β) ∇L(θ_t)  |  θ_(t+1) = θ_t - η v_t (Dampens oscillations)</text>
      </svg>
    `),
  },

  transformerAttention: {
    fileName: "Transformer_Scaled_Dot_Product_Attention.png",
    title: "Transformer Scaled Dot-Product Attention Flow",
    description: "Architectural flowchart of Query, Key, Value tensor matrix multiplication, scaling factor 1/sqrt(d_k), mask, softmax, and weighted value output.",
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background:#0f172a;font-family:system-ui,-apple-system,sans-serif;">
        <!-- Header -->
        <rect x="20" y="16" width="760" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="40" y="42" fill="#f8fafc" font-size="15" font-weight="700">FIGURE 3.2: SCALED DOT-PRODUCT ATTENTION MECHANISM</text>
        <text x="610" y="42" fill="#ec4899" font-size="12" font-weight="600">ATTENTION(Q, K, V)</text>

        <!-- Input Q and K -->
        <rect x="260" y="80" width="90" height="38" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="305" y="104" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">Query (Q)</text>

        <rect x="420" y="80" width="90" height="38" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="465" y="104" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">Key (K)</text>

        <!-- MatMul Box 1 -->
        <rect x="330" y="145" width="120" height="38" rx="6" fill="#a855f7" stroke="#c084fc" stroke-width="1.5"/>
        <text x="390" y="169" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">MatMul (Q · Kᵀ)</text>

        <!-- Scale Box -->
        <rect x="330" y="210" width="120" height="38" rx="6" fill="#3b82f6" stroke="#60a5fa" stroke-width="1.5"/>
        <text x="390" y="234" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">Scale (÷ √d_k)</text>

        <!-- Mask (Optional) -->
        <rect x="330" y="270" width="120" height="34" rx="6" fill="#64748b" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 2"/>
        <text x="390" y="292" fill="#ffffff" font-size="11" font-weight="600" text-anchor="middle">Mask (Opt. Causal)</text>

        <!-- Softmax Box -->
        <rect x="330" y="325" width="120" height="38" rx="6" fill="#ec4899" stroke="#f472b6" stroke-width="1.5"/>
        <text x="390" y="349" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">Softmax (Weights)</text>

        <!-- Value Box V -->
        <rect x="180" y="325" width="90" height="38" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="225" y="349" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">Value (V)</text>

        <!-- Final MatMul -->
        <rect x="250" y="390" width="140" height="40" rx="6" fill="#22c55e" stroke="#4ade80" stroke-width="2"/>
        <text x="320" y="415" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">MatMul → Context</text>

        <!-- Flow Lines -->
        <g stroke="#94a3b8" stroke-width="2" fill="none">
          <line x1="305" y1="118" x2="360" y2="145"/>
          <line x1="465" y1="118" x2="420" y2="145"/>
          <line x1="390" y1="183" x2="390" y2="210"/>
          <line x1="390" y1="248" x2="390" y2="270"/>
          <line x1="390" y1="304" x2="390" y2="325"/>
          <line x1="390" y1="363" x2="350" y2="390"/>
          <line x1="225" y1="363" x2="280" y2="390"/>
        </g>

        <!-- Right Side Formula & Explanations -->
        <rect x="520" y="145" width="240" height="218" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="540" y="175" fill="#ec4899" font-size="12" font-weight="700">CORE FORMULA:</text>
        <text x="540" y="200" fill="#f8fafc" font-size="12" font-weight="600">Attention(Q, K, V) =</text>
        <text x="540" y="225" fill="#38bdf8" font-size="12" font-family="monospace">softmax( Q Kᵀ / √d_k ) V</text>
        <line x1="540" y1="245" x2="730" y2="245" stroke="#334155"/>
        <text x="540" y="265" fill="#94a3b8" font-size="11">• Scale √d_k prevents</text>
        <text x="550" y="280" fill="#94a3b8" font-size="11">extremely large dot products</text>
        <text x="550" y="295" fill="#94a3b8" font-size="11">that push softmax to small gradients</text>
        <text x="540" y="320" fill="#94a3b8" font-size="11">• Output is weighted sum of</text>
        <text x="550" y="335" fill="#94a3b8" font-size="11">value vectors V based on score</text>
      </svg>
    `),
  },
};

export function getSampleDiagramByFileName(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.includes("neural") || lower.includes("cnn") || lower.includes("network")) {
    return SAMPLE_DIAGRAMS.neuralNetwork;
  }
  if (lower.includes("gradient") || lower.includes("contour") || lower.includes("optimization")) {
    return SAMPLE_DIAGRAMS.gradientDescent;
  }
  if (lower.includes("attention") || lower.includes("transformer") || lower.includes("nlp")) {
    return SAMPLE_DIAGRAMS.transformerAttention;
  }
  return SAMPLE_DIAGRAMS.neuralNetwork;
}
