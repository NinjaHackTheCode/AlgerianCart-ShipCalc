import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

/* --------- YOUR DATA (unchanged) --------- */
const EXCLUDED = new Set([
    "Adrar",
    "Tindouf",
    "Djanet",
    "Tamanrasset",
    "Illizi",
    "In Guezzam",
    "In Salah",
    "Timimoun",
    "Bordj Badji Mokhtar",
]);

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
    [19, "Sétif"],
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

/* ---------- PRICING HELPERS (final logic) ---------- */
// قاعدة السعر حسب الولاية ونوع التوصيل
function getRulePrice(wilayaName, type /* "home" | "desk" */) {
    if (wilayaName === "Tizi Ouzou") {
        // تيزي وزو: لا تتجاوز 400 (و 300 للـ desk)
        return type === "desk" ? 300 : 400;
    }
    if (ADJACENT_TO_TZO.has(wilayaName)) {
        // ولايات ملاصقة: لا تتجاوز 500
        return 500;
    }
    // باقي الولايات: لا تتجاوز 600
    return 600;
}

/**
 * منطق التسعير النهائي:
 * - لو ما فيش سعر شركة => نرجّع سعر القاعدة (اللي هو أصلاً مقيد 400/500/600 أو 300 لتيزي-دِسك).
 * - لو سعر الشركة أقل من القاعدة => نأخذ سعر الشركة (ما نرفعش).
 * - لو سعر الشركة أعلى من القاعدة => نأخذ سعر القاعدة (وبكذا لو الريميز > 250 "نخليه يمر").
 * ملاحظة: بهذه القاعدة، ما فيش سقف 250 للتخفيض؛ إذا الفرق أكبر من 250 نسمح به.
 */
function applyDiscountCap(rulePrice, listPrice) {
    // no company price -> use baseline
    if (listPrice == null || isNaN(listPrice)) return rulePrice;

    // company cheaper than baseline -> don't raise
    if (listPrice <= rulePrice) return listPrice;

    // company more expensive -> cap remise at 250
    return Math.max(rulePrice, listPrice - 250);
}

/* ---------- COMPANY DEFAULTS (from your list) ---------- */
/* desk = null where "************" */
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
    Sétif: { home: 800, desk: 450 },
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

/* ---------- build initial (prefill from defaults) ---------- */
function buildInitialOfficialPrices() {
    const obj = {};
    ALL_WILAYAS.forEach(([, name]) => {
        if (EXCLUDED.has(name)) return; // don't show excluded in table
        const def = DEFAULT_OFFICIAL[name] || { home: null, desk: null };
        obj[name] = { ...def };
    });
    return obj;
}
/* --------- END YOUR DATA --------- */

export default function App() {
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
    );
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const [official, setOfficial] = useState(() => {
        const saved = localStorage.getItem("officialPrices");
        return saved ? JSON.parse(saved) : buildInitialOfficialPrices();
    });
    useEffect(() => {
        localStorage.setItem("officialPrices", JSON.stringify(official));
    }, [official]);

    const wilayas = useMemo(
        () => ALL_WILAYAS.filter(([, n]) => !EXCLUDED.has(n)),
        []
    );

    const [selected, setSelected] = useState("Tizi Ouzou");
    const [type, setType] = useState("home"); // "home" | "desk"

    const rulePrice = getRulePrice(selected, type);
    const isAdjacent = ADJACENT_TO_TZO.has(selected); // للعرض فقط
    const listPrice = official[selected]?.[type] ?? null;
    const finalPrice = applyDiscountCap(rulePrice, listPrice);

    return (
        <main className="app" dir="rtl">
            {/* gradient header */}
            <header className="hero fade-in">
                <div className="hero__content">
                    <h1>حاسبة سعر التوصيل — الجزائر (COD)</h1>
                    <p>واجهة سريعة، ألوان مرتبة، وثيم فاتح/داكن ✨</p>
                </div>
                <button
                    className="theme-toggle"
                    onClick={() =>
                        setTheme((t) => (t === "light" ? "dark" : "light"))
                    }
                    aria-label="Toggle theme"
                    title="تبديل الثيم"
                >
                    {theme === "light" ? "🌙" : "🌞"}
                </button>
            </header>

            <section className="grid">
                {/* calculator */}
                <div className="card slide-up">
                    <h2 className="card__title">
                        1) اختر الولاية ونوع التوصيل
                    </h2>

                    <label className="label">الولاية</label>
                    <div className="select-wrap">
                        <select
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            className="select"
                        >
                            {wilayas.map(([code, name]) => (
                                <option key={code} value={name}>
                                    {String(code).padStart(2, "0")} — {name}
                                </option>
                            ))}
                        </select>
                        <span className="select__chev">▾</span>
                    </div>

                    <div className="radio-row">
                        <label className="radio">
                            <input
                                type="radio"
                                name="type"
                                value="home"
                                checked={type === "home"}
                                onChange={() => setType("home")}
                            />
                            <span>توصيل للمنزل</span>
                        </label>
                        <label className="radio">
                            <input
                                type="radio"
                                name="type"
                                value="desk"
                                checked={type === "desk"}
                                onChange={() => setType("desk")}
                            />
                            <span>نقطة استلام</span>
                        </label>
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
                    </ul>

                    <div className="total bounce-in">
                        <div className="total__label">السعر النهائي للعميل</div>
                        <div className="total__value">
                            {finalPrice.toLocaleString()} دج
                        </div>
                        {/* ملاحظة توضيحية سابقة — تُركت كمعلومة فقط */}
                        {false &&
                            listPrice &&
                            listPrice > rulePrice &&
                            listPrice - rulePrice > 250 && (
                                <div className="total__note">
                                    * سابقًا كان في سقف 250 دج للتخفيض. الآن
                                    نسمح بتخفيض أكبر عند الحاجة.
                                </div>
                            )}
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
            </section>
        </main>
    );
}

/* ========= subcomponents ========= */
function OfficialTable({ official, onChange }) {
    const entries = Object.entries(official);
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
                            <th>السعر الرسمي — نقطة</th>
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
                                        placeholder="مثال: 800"
                                    />
                                </td>
                                <td>
                                    <NumberInput
                                        value={desk}
                                        onChange={(v) =>
                                            onChange(name, "desk", v)
                                        }
                                        placeholder="مثال: 450"
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
