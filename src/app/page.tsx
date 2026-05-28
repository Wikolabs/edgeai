export default function EdgeAI() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-body)" }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-400 rounded flex items-center justify-center">
              <span className="text-gray-900 font-bold text-xs" style={{ fontFamily: "var(--font-display)" }}>E</span>
            </div>
            <span className="font-bold text-green-400 text-xl tracking-widest" style={{ fontFamily: "var(--font-display)" }}>EdgeAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400" style={{ fontFamily: "var(--font-display)" }}>
            <a href="#compare" className="hover:text-green-400 transition-colors">Benchmark</a>
            <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
            <a href="#usecases" className="hover:text-green-400 transition-colors">Use cases</a>
          </div>
          <a href="#cta" className="bg-green-400 text-gray-900 px-5 py-2 rounded font-bold text-sm hover:bg-green-300 transition-colors" style={{ fontFamily: "var(--font-display)" }}>
            Demander une démo
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #4ade80 39px, #4ade80 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #4ade80 39px, #4ade80 40px)" }} />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="inline-flex items-center gap-2 bg-green-400/10 text-green-400 border border-green-400/30 px-4 py-2 rounded text-sm mb-8" style={{ fontFamily: "var(--font-display)" }}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            INFERENCE ON-DEVICE — NO CLOUD REQUIRED
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
            L'IA qui tourne<br />
            <span className="text-green-400">sans internet.</span>
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mb-10 leading-relaxed">
            Inférence embarquée sur Raspberry Pi, NVIDIA Jetson, STM32 et microcontrôleurs.
            Latence inférieure à 10ms. Zéro dépendance cloud. Zéro données transmises.
          </p>

          {/* Terminal mock */}
          <div className="bg-gray-950 border border-gray-700 rounded-lg p-6 max-w-2xl mb-12 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-500 text-xs ml-2" style={{ fontFamily: "var(--font-display)" }}>edge-runtime — /dev/ttyUSB0</span>
            </div>
            <div className="space-y-1.5 text-xs" style={{ fontFamily: "var(--font-display)" }}>
              <div><span className="text-green-400">$</span> <span className="text-gray-300">edgeai deploy --model yolov8n.onnx --target rpi4</span></div>
              <div className="text-gray-500">› Quantizing INT8... done (3.2MB)</div>
              <div className="text-gray-500">› Flashing OTA... 100%</div>
              <div className="text-green-400">✓ Model running at 8ms/inference — offline</div>
              <div className="text-gray-500">› Detections: <span className="text-yellow-400">anomaly_detected=true</span> conf=0.94</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#cta" className="bg-green-400 text-gray-900 px-8 py-4 rounded font-bold text-lg hover:bg-green-300 transition-colors" style={{ fontFamily: "var(--font-display)" }}>
              Déployer sur mon hardware →
            </a>
            <a href="#compare" className="border border-gray-600 text-gray-300 hover:border-green-400 hover:text-green-400 px-8 py-4 rounded font-bold text-lg transition-colors" style={{ fontFamily: "var(--font-display)" }}>
              Voir le benchmark
            </a>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section id="compare" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-14" style={{ fontFamily: "var(--font-display)" }}>
            Cloud AI vs Edge AI — les faits
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-300 shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="px-6 py-4 text-left font-bold" style={{ fontFamily: "var(--font-display)" }}>Critère</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-400" style={{ fontFamily: "var(--font-display)" }}>Cloud AI</th>
                  <th className="px-6 py-4 text-center font-bold text-green-400" style={{ fontFamily: "var(--font-display)" }}>EdgeAI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Latence moyenne", cloud: "~500ms", edge: "< 8ms", good: "edge" },
                  { label: "Connexion internet requise", cloud: "Oui", edge: "Non", good: "edge" },
                  { label: "Coût par requête", cloud: "$0.002", edge: "$0.0001", good: "edge" },
                  { label: "Données envoyées hors-site", cloud: "Toutes", edge: "Aucune", good: "edge" },
                  { label: "Disponibilité hors réseau", cloud: "0%", edge: "100%", good: "edge" },
                  { label: "Déploiement OTA", cloud: "Partiel", edge: "Natif", good: "edge" },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-6 py-4 font-medium text-gray-700">{row.label}</td>
                    <td className="px-6 py-4 text-center text-red-500 font-mono">{row.cloud}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold font-mono">{row.edge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="usecases" className="py-20 bg-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14" style={{ fontFamily: "var(--font-display)" }}>
            Déployé en production
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { tag: "MANUFACTURING", title: "Inspection qualité usine", desc: "Détection de défauts sur ligne de production à 60fps. Aucun faux-négatif en 6 mois. Déployé sur Jetson Orin NX.", metric: "0 défaut manqué / 2M pièces inspectées" },
              { tag: "INDUSTRIE 4.0", title: "Détection anomalie capteur", desc: "Analyse vibratoire temps réel sur moteurs industriels. Prédiction de panne 48h à l'avance. STM32 + EdgeAI.", metric: "< 8ms de latence sur microcontrôleur" },
            ].map((uc) => (
              <div key={uc.title} className="bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-green-400/50 transition-colors">
                <span className="text-green-400 text-xs font-bold tracking-widest mb-3 block" style={{ fontFamily: "var(--font-display)" }}>{uc.tag}</span>
                <h3 className="text-white text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>{uc.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{uc.desc}</p>
                <div className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-green-400 text-xs font-mono">{uc.metric}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-14" style={{ fontFamily: "var(--font-display)" }}>
            Stack technique
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Quantization INT8/FP16", desc: "Réduction jusqu'à 75% de la taille modèle sans perte de précision. Supporte PyTorch, TensorFlow et JAX.", badge: "Automatique" },
              { title: "Export ONNX universel", desc: "Un seul format pour tous les targets : Jetson, Raspberry Pi, STM32, ESP32. Pipeline CI/CD intégré.", badge: "Multi-target" },
              { title: "Déploiement OTA", desc: "Mise à jour des modèles à distance sur flotte de devices sans interruption de service. Rollback en 1 commande.", badge: "Fleet-ready" },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <span className="inline-block bg-gray-900 text-green-400 text-xs px-3 py-1 rounded font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>{f.badge}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-3" style={{ fontFamily: "var(--font-display)" }}>{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 bg-gray-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Votre modèle tourne offline en 48h
          </h2>
          <p className="text-gray-400 text-lg mb-10">Envoyez-nous votre architecture hardware. On s'occupe du reste.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button" target="_blank" rel="noopener noreferrer" className="inline-block bg-green-400 text-gray-900 hover:bg-green-300 px-10 py-5 rounded font-bold text-xl transition-colors shadow-xl" style={{ fontFamily: "var(--font-display)" }}>
              📅 Réserver un créneau →
            </button>
            <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20EdgeAI%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-5 rounded font-bold text-xl transition-colors shadow-xl" style={{ background: "#25d366", borderColor: "#25d366", color: "#fff", fontFamily: "var(--font-display)" }}>
              💬 WhatsApp →
            </a>
          </div>
          <p className="text-gray-600 text-sm mt-5" style={{ fontFamily: "var(--font-display)" }}>POC en 48h. Compatible Raspberry Pi, Jetson, STM32, ESP32.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-500 py-10 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-bold text-green-400 text-xl tracking-widest" style={{ fontFamily: "var(--font-display)" }}>EdgeAI</span>
          <p className="text-sm">© 2025 EdgeAI — Un produit <a href="https://wikolabs.com" className="text-gray-400 hover:text-green-400 transition-colors">Wikolabs</a></p>
          <div className="flex flex-wrap gap-4 text-sm" style={{ fontFamily: "var(--font-display)" }}>
            <a href="mailto:team@wikolabs.com" className="hover:text-green-400 transition-colors">team@wikolabs.com</a>
            <span>·</span>
            <a href="tel:+261386626100" className="hover:text-green-400 transition-colors">+261 38 66 261 00</a>
            <span>·</span>
            <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors" style={{cursor:"pointer",background:"none",border:"none",padding:0,font:"inherit",color:"inherit",textDecoration:"none"}}>Prendre RDV</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
