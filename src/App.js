import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

/* --------- DEFAULT EXCLUDED (editable in UI) --------- */
const DEFAULT_EXCLUDED = [
    "Adrar",
    "Tindouf",
    "Djanet",
    "Tamanrasset",
    "Illizi",
    "In Guezzam",
    "In Salah",
    "Timimoun",
    "Bordj Badji Mokhtar",
];

const ALL_WILAYAS = [
    [1, "Adrar"],
    [2, "Chlef"],
    [3, "Laghouat"],
    [4, "Oum El Bouaghi"],
    [5, "Batna"],
    [6, "Béjaïa"],
    [7, "Biskra"],
    [8, "Béchar"],
    [9, "Blida"],
    [10, "Bouira"],
    [11, "Tamanrasset"],
    [12, "Tébessa"],
    [13, "Tlemcen"],
    [14, "Tiaret"],
    [15, "Tizi Ouzou"],
    [16, "Alger"],
    [17, "Djelfa"],
    [18, "Jijel"],
    [19, "Sétيف"],
    [20, "Saïda"],
    [21, "Skikda"],
    [22, "Sidi Bel Abbès"],
    [23, "Annaba"],
    [24, "Guelma"],
    [25, "Constantine"],
    [26, "Médéa"],
    [27, "Mostaganem"],
    [28, "M'Sila"],
    [29, "Mascara"],
    [30, "Ouargla"],
    [31, "Oran"],
    [32, "El Bayadh"],
    [33, "Illizi"],
    [34, "Bordj Bou Arréridj"],
    [35, "Boumerdès"],
    [36, "El Tarf"],
    [37, "Tindouf"],
    [38, "Tissemsilt"],
    [39, "El Oued"],
    [40, "Khenchela"],
    [41, "Souk Ahras"],
    [42, "Tipaza"],
    [43, "Mila"],
    [44, "Aïn Defla"],
    [45, "Naâma"],
    [46, "Aïn Témouchent"],
    [47, "Ghardaïa"],
    [48, "Relizane"],
    [49, "Timimoun"],
    [50, "Bordj Badji Mokhtar"],
    [51, "Ouled Djellal"],
    [52, "Béni Abbès"],
    [53, "In Salah"],
    [54, "In Guezzam"],
    [55, "Touggourt"],
    [56, "Djanet"],
    [57, "El M'Ghair"],
    [58, "El Meniaa"],
];

const ADJACENT_TO_TZO = new Set(["Béjaïa", "Bouira", "Boumerdès"]);
const RULE_PRICE = { base: 600, tizi: 400, adjacent: 500 };

/* ---------- PRICING HELPERS ---------- */
function getRulePrice(wilayaName, type /* "home" | "desk" */) {
    if (wilayaName === "Tizi Ouzou") {
        return type === "desk" ? 300 : 400; // 300 desk / 400 home
    }
    if (ADJACENT_TO_TZO.has(wilayaName)) return 500;
    return 600;
}

/** Don't raise if company is cheaper; cap the remise by `cap` DA */
function applyDiscountCap(rulePrice, listPrice, cap) {
    if (listPrice == null || isNaN(listPrice)) return rulePrice;
    if (listPrice <= rulePrice) return listPrice; // don't raise
    const safeCap = Number.isFinite(cap) ? Math.max(0, cap) : 250;
    return Math.max(rulePrice, listPrice - safeCap);
}

/* ---------- COMPANY DEFAULTS (your list) ---------- */
const DEFAULT_OFFICIAL = {
    Adrar: { home: 1400, desk: null },
    Chlef: { home: 800, desk: 450 },
    Laghouat: { home: 950, desk: 550 },
    "Oum El Bouaghi": { home: 800, desk: 450 },
    Batna: { home: 800, desk: 450 },
    Béjaïa: { home: 750, desk: 450 },
    Biskra: { home: 950, desk: 550 },
    Béchar: { home: 1100, desk: 600 },
    Bouira: { home: 750, desk: 450 },
    Blida: { home: 800, desk: 450 },
    Tamanrasset: { home: 1500, desk: 750 },
    Tébessa: { home: 900, desk: 450 },
    Tlemcen: { home: 850, desk: 450 },
    Tiaret: { home: 800, desk: 450 },
    "Tizi Ouzou": { home: 500, desk: 300 },
    Alger: { home: 700, desk: 450 },
    Djelfa: { home: 950, desk: 450 },
    Jijel: { home: 800, desk: 450 },
    Sétيف: { home: 800, desk: 450 },
    Saïda: { home: 850, desk: 450 },
    Skikda: { home: 800, desk: 450 },
    "Sidi Bel Abbès": { home: 800, desk: 450 },
    Annaba: { home: 800, desk: 450 },
    Guelma: { home: 800, desk: 450 },
    Constantine: { home: 800, desk: 450 },
    Médéa: { home: 800, desk: 450 },
    Mostaganem: { home: 800, desk: 450 },
    "M'Sila": { home: 850, desk: 450 },
    Mascara: { home: 800, desk: 450 },
    Ouargla: { home: 950, desk: null },
    Oran: { home: 800, desk: 450 },
    "El Bayadh": { home: 1050, desk: 600 },
    Illizi: { home: 1750, desk: null },
    "Bordj Bou Arréridj": { home: 800, desk: 450 },
    Boumerdès: { home: 750, desk: 450 },
    "El Tarf": { home: 850, desk: 450 },
    Tindouf: { home: 1750, desk: null },
    Tissemsilt: { home: 900, desk: null },
    "El Oued": { home: 950, desk: 550 },
    Khenchela: { home: 800, desk: 450 },
    "Souk Ahras": { home: 800, desk: 450 },
    Tipaza: { home: 850, desk: 450 },
    Mila: { home: 800, desk: 450 },
    "Aïn Defla": { home: 800, desk: 450 },
    Naâma: { home: 1100, desk: 550 },
    "Aïn Témouchent": { home: 850, desk: 450 },
    Ghardaïa: { home: 900, desk: 600 },
    Relizane: { home: 850, desk: 450 },
    Timimoun: { home: 1400, desk: null },
    "Bordj Badji Mokhtar": { home: 1500, desk: null },
    "Ouled Djellal": { home: 950, desk: null },
    "Béni Abbès": { home: 1000, desk: null },
    "In Salah": { home: 1600, desk: null },
    "In Guezzam": { home: 1600, desk: null },
    Touggourt: { home: 950, desk: 550 },
    Djanet: { home: 1750, desk: null },
    "El M'Ghair": { home: 900, desk: null },
    "El Meniaa": { home: 1000, desk: null },
};

/* ---------- initial official (include ALL; UI will filter) ---------- */
function buildInitialOfficialPrices() {
    const obj = {};
    ALL_WILAYAS.forEach(([, name]) => {
        const def = DEFAULT_OFFICIAL[name] || { home: null, desk: null };
        obj[name] = { ...def };
    });
    return obj;
}

/* ===================================================== */

export default function App() {
    /* theme */
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
    );
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    /* official prices */
    const [official, setOfficial] = useState(() => {
        const saved = localStorage.getItem("officialPrices");
        return saved ? JSON.parse(saved) : buildInitialOfficialPrices();
    });
    useEffect(() => {
        localStorage.setItem("officialPrices", JSON.stringify(official));
    }, [official]);

    /* excluded (editable) */
    const [excluded, setExcluded] = useState(() => {
        const saved = localStorage.getItem("excludedWilayasV1");
        return new Set(saved ? JSON.parse(saved) : DEFAULT_EXCLUDED);
    });
    useEffect(() => {
        localStorage.setItem(
            "excludedWilayasV1",
            JSON.stringify([...excluded])
        );
    }, [excluded]);

    /* lists filtered by exclusions */
    const wilayas = useMemo(
        () => ALL_WILAYAS.filter(([, n]) => !excluded.has(n)),
        [excluded]
    );

    /* selection */
    const [selected, setSelected] = useState("Tizi Ouzou");
    const [type, setType] = useState("home"); // "home" | "desk"

    useEffect(() => {
        // if current selected becomes excluded, jump to first available
        if (excluded.has(selected)) {
            const first = wilayas[0]?.[1] || "Tizi Ouzou";
            setSelected(first);
        }
    }, [excluded, selected, wilayas]);

    /* ===== Max Remise (editable, persists) ===== */
    const [maxRemise, setMaxRemise] = useState(() => {
        const saved = localStorage.getItem("maxRemise");
        const n = saved == null ? 250 : Number(saved);
        return Number.isFinite(n) ? n : 250;
    });
    useEffect(() => {
        localStorage.setItem("maxRemise", String(maxRemise));
    }, [maxRemise]);

    /* pricing */
    const rulePrice = getRulePrice(selected, type);
    const isAdjacent = ADJACENT_TO_TZO.has(selected); // info only
    const listPrice = official[selected]?.[type] ?? null;
    const finalPrice = applyDiscountCap(rulePrice, listPrice, maxRemise);

    // quick filter chips
    const [segment, setSegment] = useState("all");
    const displayedWilayas = useMemo(() => {
        return wilayas.filter(([code, name]) => {
            if (segment === "all") return true;
            if (segment === "tizi") return name === "Tizi Ouzou";
            if (segment === "adj") return ADJACENT_TO_TZO.has(name);
            if (segment === "others")
                return name !== "Tizi Ouzou" && !ADJACENT_TO_TZO.has(name);
            return true;
        });
    }, [wilayas, segment]);

    // keep selection in view when filtering
    useEffect(() => {
        if (!displayedWilayas.some(([, n]) => n === selected)) {
            const best =
                displayedWilayas[0]?.[1] || wilayas[0]?.[1] || selected;
            setSelected(best);
        }
    }, [segment, displayedWilayas, selected, wilayas]);

    return (
        <main className="app" dir="rtl">
            {/* header */}
            <header className="hero fade-in">
                <div className="hero__content">
                    <h1>AlgerianCart ShipCalc</h1>
                    <p>حاسبة سعر التوصيل — الجزائر (COD)</p>
                </div>

                {/* iOS-like theme switch */}
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={theme === "dark"}
                        onChange={() =>
                            setTheme((t) => (t === "light" ? "dark" : "light"))
                        }
                        aria-label="Toggle theme"
                    />
                    <span className="slider">
                        <span className="knob">
                            {theme === "dark" ? "🌙" : "🌞"}
                        </span>
                    </span>
                </label>
            </header>

            <section className="grid">
                {/* calculator */}
                <div className="card slide-up">
                    <h2 className="card__title">
                        1) اختر الولاية ونوع التوصيل
                    </h2>

                    {/* quick chips */}
                    <div className="chips">
                        <button
                            className={`chip ${
                                segment === "all" ? "chip--on" : ""
                            }`}
                            onClick={() => setSegment("all")}
                        >
                            الكل
                        </button>
                        <button
                            className={`chip ${
                                segment === "tizi" ? "chip--on" : ""
                            }`}
                            onClick={() => setSegment("tizi")}
                        >
                            تيزي وزو
                        </button>
                        <button
                            className={`chip ${
                                segment === "adj" ? "chip--on" : ""
                            }`}
                            onClick={() => setSegment("adj")}
                        >
                            ملاصقة
                        </button>
                        <button
                            className={`chip ${
                                segment === "others" ? "chip--on" : ""
                            }`}
                            onClick={() => setSegment("others")}
                        >
                            باقي الولايات
                        </button>
                    </div>

                    <label className="label">الولاية</label>
                    <div className="select-wrap">
                        <select
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            className="select"
                        >
                            {displayedWilayas.map(([code, name]) => (
                                <option key={code} value={name}>
                                    {String(code).padStart(2, "0")} — {name}
                                </option>
                            ))}
                        </select>
                        <span className="select__chev">▾</span>
                    </div>
                    <div className="picker-hint">
                        <span className="badge">
                            {String(
                                ALL_WILAYAS.find(
                                    ([, n]) => n === selected
                                )?.[0] || ""
                            ).padStart(2, "0")}
                        </span>
                        <span className="muted">رمز الولاية المختارة</span>
                    </div>

                    {/* segmented control for type */}
                    <div
                        className="segmented"
                        role="tablist"
                        aria-label="نوع التوصيل"
                    >
                        <button
                            role="tab"
                            aria-selected={type === "home"}
                            className={`segmented__btn ${
                                type === "home" ? "is-active" : ""
                            }`}
                            onClick={() => setType("home")}
                        >
                            توصيل للمنزل
                        </button>
                        <button
                            role="tab"
                            aria-selected={type === "desk"}
                            className={`segmented__btn ${
                                type === "desk" ? "is-active" : ""
                            }`}
                            onClick={() => setType("desk")}
                        >
                            نقطة استلام
                        </button>
                    </div>

                    {/* max remise editor */}
                    <div style={{ marginTop: 12 }}>
                        <label className="label">
                            الحد الأقصى للريميز (دج)
                        </label>
                        <div className="input-wrap" style={{ maxWidth: 220 }}>
                            <NumberInput
                                value={maxRemise}
                                onChange={(v) =>
                                    setMaxRemise(v == null ? 0 : Math.max(0, v))
                                }
                                placeholder="250"
                            />
                            <button
                                className="btn"
                                style={{ marginInlineStart: 8 }}
                                onClick={() => setMaxRemise(250)}
                                title="إرجاع القيمة الافتراضية"
                            >
                                إعادة 250
                            </button>
                        </div>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            إذا كان سعر الشركة أعلى من القاعدة، يُطبَّق خصم
                            أقصاه {maxRemise.toLocaleString()} دج.
                        </p>
                    </div>

                    <ul className="facts">
                        <li>
                            <b>حسب القاعدة:</b> {rulePrice.toLocaleString()} دج{" "}
                            {selected === "Tizi Ouzou"
                                ? "(داخل تيزي وزو)"
                                : isAdjacent
                                ? "(ولاية ملاصقة)"
                                : "(ولاية أخرى)"}
                        </li>
                        <li>
                            <b>السعر الرسمي (اختياري):</b>{" "}
                            {listPrice
                                ? `${listPrice.toLocaleString()} دج`
                                : "—"}
                        </li>
                        <li>
                            <b>الريميز الأقصى:</b> {maxRemise.toLocaleString()}{" "}
                            دج
                        </li>
                    </ul>

                    <div className="total bounce-in">
                        <div className="total__label">السعر النهائي للعميل</div>
                        <div className="total__value">
                            {finalPrice.toLocaleString()} دج
                        </div>
                    </div>
                </div>

                {/* official prices table */}
                <div className="card slide-up delay-1">
                    <h2 className="card__title">
                        2) لائحة الأسعار الرسمية (شركة الشحن)
                    </h2>
                    <p className="muted">
                        تم تعبئة القيم افتراضيًا حسب قائمتك. أي تعديل يُحفَظ
                        تلقائيًا.
                    </p>

                    <OfficialTable
                        official={official}
                        excluded={excluded}
                        onChange={(name, key, val) =>
                            setOfficial((prev) => ({
                                ...prev,
                                [name]: { ...prev[name], [key]: val },
                            }))
                        }
                    />

                    <div className="actions">
                        <button
                            className="btn btn--primary"
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    JSON.stringify(official, null, 2)
                                )
                            }
                        >
                            نسخ البيانات
                        </button>
                        <button
                            className="btn"
                            onClick={() => {
                                if (
                                    confirm(
                                        "متأكد تريد مسح جميع الأسعار المحفوظة؟"
                                    )
                                ) {
                                    localStorage.removeItem("officialPrices");
                                    window.location.reload();
                                }
                            }}
                        >
                            مسح الحفظ
                        </button>
                    </div>
                </div>

                {/* excluded editor */}
                <div className="card slide-up delay-2">
                    <h2 className="card__title">3) الولايات المستبعدة</h2>
                    <p className="muted">
                        اختر الولايات التي لا تريد عرضها في الحاسبة والجدول.
                        الحفظ تلقائي.
                    </p>
                    <ExcludedEditor
                        excluded={excluded}
                        setExcluded={setExcluded}
                    />
                </div>
            </section>
        </main>
    );
}

/* ========= subcomponents ========= */

function OfficialTable({ official, onChange, excluded }) {
    const entries = Object.entries(official).filter(
        ([name]) => !excluded.has(name)
    );
    const [q, setQ] = useState("");
    const filtered = entries.filter(([name]) =>
        name.toLowerCase().includes(q.toLowerCase())
    );

    return (
        <>
            <input
                className="search"
                placeholder="ابحث عن ولاية…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
            />

            <div className="table-wrap">
                <table className="table" aria-label="قائمة أسعار الشركة">
                    <thead>
                        <tr>
                            <th>الولاية</th>
                            <th>السعر الرسمي — منزل</th>
                            <th>السعر الرسمي — نقطة إستلام</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(([name, { home, desk }]) => (
                            <tr key={name}>
                                <td className="cell-w">{name}</td>
                                <td>
                                    <NumberInput
                                        value={home}
                                        onChange={(v) =>
                                            onChange(name, "home", v)
                                        }
                                        placeholder="فارغ"
                                    />
                                </td>
                                <td>
                                    <NumberInput
                                        value={desk}
                                        onChange={(v) =>
                                            onChange(name, "desk", v)
                                        }
                                        placeholder="فارغ"
                                    />
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={3} className="empty">
                                    لا توجد نتائج.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function NumberInput({ value, onChange, placeholder }) {
    const [raw, setRaw] = useState(value ?? "");
    useEffect(() => setRaw(value ?? ""), [value]);

    return (
        <div className="input-wrap">
            <input
                value={raw}
                inputMode="numeric"
                placeholder={placeholder}
                onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, "");
                    setRaw(v);
                    onChange(v === "" ? null : Number(v));
                }}
                className="num-input"
            />
            <span className="suffix">دج</span>
        </div>
    );
}

/* ===== Excluded Editor (checkbox list) ===== */
function ExcludedEditor({ excluded, setExcluded }) {
    const [q, setQ] = useState("");

    const filtered = ALL_WILAYAS.filter(([, n]) =>
        n.toLowerCase().includes(q.toLowerCase())
    );

    const toggle = (name) => {
        setExcluded((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const setDefault = () => setExcluded(new Set(DEFAULT_EXCLUDED));
    const clearAll = () => setExcluded(new Set());

    return (
        <div>
            <div className="actions" style={{ marginBottom: 8 }}>
                <button className="btn" onClick={setDefault}>
                    تحديد الافتراضي
                </button>
                <button className="btn" onClick={clearAll}>
                    إلغاء الكل
                </button>
            </div>

            <input
                className="search"
                placeholder="ابحث عن ولاية…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
            />

            <div
                className="table-wrap"
                style={{ maxHeight: 320, overflow: "auto" }}
            >
                <table className="table" aria-label="الولايات المستبعدة">
                    <thead>
                        <tr>
                            <th>استبعاد</th>
                            <th>الرقم</th>
                            <th>الولاية</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(([code, name]) => (
                            <tr key={name}>
                                <td style={{ width: 90 }}>
                                    {/* fancy toggle */}
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={excluded.has(name)}
                                            onChange={() => toggle(name)}
                                        />
                                        <span className="track">
                                            <span className="dot" />
                                        </span>
                                    </label>
                                </td>
                                <td>
                                    <span className="badge">
                                        {String(code).padStart(2, "0")}
                                    </span>
                                </td>
                                <td className="cell-w">{name}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={3} className="empty">
                                    لا توجد نتائج.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="muted" style={{ marginTop: 8 }}>
                المُستبعدة حاليًا: {excluded.size} ولاية.
            </p>
        </div>
    );
}
