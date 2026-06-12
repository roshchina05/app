import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "in-my-mind-v3";

const STANDARD_BLOCKS_TEMPLATE = {
  movies: { key: "movies", title: "Фильмы и сериалы", items: [] },
  books: { key: "books", title: "Книги", items: [] },
  places: { key: "places", title: "Места", items: [] },
  wishlist: { key: "wishlist", title: "Вишлист", items: [] },
  thoughts: { key: "thoughts", title: "Мысли", items: [] },
  ideas: { key: "ideas", title: "Идеи", items: [] },
};

const CUSTOM_ICON_OPTIONS = ["✨", "🎧", "🍳", "📝", "🎨", "🧘", "🌱"];

function createInitialData() {
  return {
    standardBlocks: JSON.parse(JSON.stringify(STANDARD_BLOCKS_TEMPLATE)),
    customBlocks: [],
  };
}

function normalizeData(parsed) {
  const safe = parsed && typeof parsed === "object" ? parsed : {};
  const savedStandard =
    safe.standardBlocks && typeof safe.standardBlocks === "object"
      ? safe.standardBlocks
      : {};
  const savedCustom = Array.isArray(safe.customBlocks) ? safe.customBlocks : [];

  const standardBlocks = {};
  Object.keys(STANDARD_BLOCKS_TEMPLATE).forEach((key) => {
    const template = STANDARD_BLOCKS_TEMPLATE[key];
    const saved = savedStandard[key];
    standardBlocks[key] = {
      key: template.key,
      title: template.title,
      items: Array.isArray(saved?.items)
        ? saved.items.filter((x) => typeof x === "string")
        : [],
    };
  });

  const customBlocks = savedCustom
    .filter((b) => b && typeof b === "object")
    .map((b) => ({
      id:
        typeof b.id === "string"
          ? b.id
          : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title:
        typeof b.title === "string" && b.title.trim()
          ? b.title.trim()
          : "Новый блок",
      icon: typeof b.icon === "string" ? b.icon : "✨",
      items: Array.isArray(b.items)
        ? b.items.filter((x) => typeof x === "string")
        : [],
    }));

  return { standardBlocks, customBlocks };
}

function StandardIcon({ type }) {
  return (
    <span className="stdIconWrap" aria-hidden>
      {type === "movies" && (
        <svg viewBox="0 0 24 24" className="stdIcon">
          <rect x="3" y="5" width="18" height="14" rx="3" fill="#FBE7C8" />
          <rect x="6" y="8" width="12" height="8" rx="1.6" fill="#FFF7E7" stroke="#E9B96E" strokeWidth="1.2" />
          <circle cx="7" cy="7" r="1" fill="#E89BAF" />
          <circle cx="11" cy="7" r="1" fill="#E9B96E" />
          <circle cx="15" cy="7" r="1" fill="#9BC4A2" />
        </svg>
      )}

      {type === "books" && (
        <svg viewBox="0 0 24 24" className="stdIcon">
          <path d="M4 7.5c0-1.4 1.1-2.5 2.5-2.5H12v13H6.5A2.5 2.5 0 0 1 4 15.5v-8z" fill="#FFF2D9" stroke="#E9B96E" strokeWidth="1.1" />
          <path d="M20 7.5c0-1.4-1.1-2.5-2.5-2.5H12v13h5.5a2.5 2.5 0 0 0 2.5-2.5v-8z" fill="#FFE9EE" stroke="#E89BAF" strokeWidth="1.1" />
          <path d="M12 5v13" stroke="#E9B96E" strokeWidth="1.1" />
        </svg>
      )}

      {type === "places" && (
        <svg viewBox="0 0 24 24" className="stdIcon">
          <path d="M12 20s6-5 6-10a6 6 0 1 0-12 0c0 5 6 10 6 10z" fill="#EAF6EC" stroke="#9BC4A2" strokeWidth="1.2" />
          <circle cx="12" cy="10" r="2.4" fill="#E9B96E" />
          <path d="M15.8 16.4c.9.2 1.5.7 1.5 1.3 0 .8-2.4 1.5-5.3 1.5s-5.3-.7-5.3-1.5c0-.6.6-1.1 1.5-1.3" stroke="#E89BAF" strokeWidth="1" fill="none" />
        </svg>
      )}

      {type === "wishlist" && (
        <svg viewBox="0 0 24 24" className="stdIcon">
          <path d="M12 19s-6.5-4.2-6.5-8.3A3.7 3.7 0 0 1 12 8.4a3.7 3.7 0 0 1 6.5 2.3C18.5 14.8 12 19 12 19z" fill="#FFE7EF" stroke="#E89BAF" strokeWidth="1.2" />
          <path d="M19 6.8l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7z" fill="#E9B96E" />
        </svg>
      )}

      {type === "thoughts" && (
        <svg viewBox="0 0 24 24" className="stdIcon">
          <path d="M7.8 15.6h7.8a3.2 3.2 0 0 0 .2-6.4 4.4 4.4 0 0 0-8.6 1.2 2.7 2.7 0 0 0 .6 5.2z" fill="#F4ECFF" stroke="#BFA7D9" strokeWidth="1.1" />
          <circle cx="9" cy="18.5" r="1.1" fill="#E9B96E" />
          <circle cx="11.4" cy="19.5" r="0.9" fill="#E89BAF" />
        </svg>
      )}

      {type === "ideas" && (
        <svg viewBox="0 0 24 24" className="stdIcon">
          <path d="M12 4.5a5.1 5.1 0 0 0-3.2 9.1c.6.5 1 .9 1.1 1.6h4.2c.1-.7.5-1.1 1.1-1.6A5.1 5.1 0 0 0 12 4.5z" fill="#FFF2D9" stroke="#E9B96E" strokeWidth="1.2" />
          <rect x="9.7" y="15.3" width="4.6" height="2.1" rx="1" fill="#E9B96E" />
          <path d="M18.4 6.5l.6 1.2 1.2.6-1.2.6-.6 1.2-.6-1.2-1.2-.6 1.2-.6.6-1.2z" fill="#E89BAF" />
        </svg>
      )}
    </span>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = createInitialData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return normalizeData(JSON.parse(raw));
    } catch {
      const fallback = createInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
  });

  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockIcon, setNewBlockIcon] = useState("✨");

  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedBlockRef, setSelectedBlockRef] = useState("standard:movies");
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const allBlocksForSelect = useMemo(() => {
    const standard = Object.entries(data.standardBlocks).map(([key, block]) => ({
      ref: `standard:${key}`,
      title: block.title,
    }));
    const custom = data.customBlocks.map((block) => ({
      ref: `custom:${block.id}`,
      title: `${block.icon || "✨"} ${block.title}`,
    }));
    return [...standard, ...custom];
  }, [data.standardBlocks, data.customBlocks]);

  const openSoonAlert = () => alert("Скоро здесь будет список");

  const addCustomBlock = (e) => {
    e.preventDefault();
    const title = newBlockTitle.trim();
    if (!title) return;

    setData((prev) => ({
      ...prev,
      customBlocks: [
        ...prev.customBlocks,
        {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title,
          icon: newBlockIcon || "✨",
          items: [],
        },
      ],
    }));
    setNewBlockTitle("");
    setNewBlockIcon("✨");
    setIsAddBlockOpen(false);
  };

  const saveEditedCustomBlock = (e) => {
    e.preventDefault();
    const title = editingTitle.trim();
    if (!title || !editingBlockId) return;

    setData((prev) => ({
      ...prev,
      customBlocks: prev.customBlocks.map((b) =>
        b.id === editingBlockId ? { ...b, title } : b
      ),
    }));
    setEditingBlockId(null);
    setEditingTitle("");
  };

  const deleteCustomBlock = (blockId) => {
    const ok = window.confirm("Точно удалить блок? Все данные будут потеряны");
    if (!ok) return;
    setData((prev) => ({
      ...prev,
      customBlocks: prev.customBlocks.filter((b) => b.id !== blockId),
    }));
  };

  const addItemToBlock = (e) => {
    e.preventDefault();
    const text = newItemText.trim();
    if (!text || !selectedBlockRef) return;

    const [kind, key] = selectedBlockRef.split(":");

    if (kind === "standard") {
      setData((prev) => ({
        ...prev,
        standardBlocks: {
          ...prev.standardBlocks,
          [key]: {
            ...prev.standardBlocks[key],
            items: [...prev.standardBlocks[key].items, text],
          },
        },
      }));
    } else {
      setData((prev) => ({
        ...prev,
        customBlocks: prev.customBlocks.map((b) =>
          b.id === key ? { ...b, items: [...b.items, text] } : b
        ),
      }));
    }

    setNewItemText("");
    setSelectedBlockRef("standard:movies");
    setIsAddItemOpen(false);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Inter, sans-serif;
          background: #F8F4ED;
          color: #3F2E2A;
        }

        .splash {
          min-height: 100vh;
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          background:
            radial-gradient(circle at 88% 12%, rgba(233,185,110,.26) 0%, rgba(233,185,110,0) 42%),
            linear-gradient(180deg, #F8F4ED 0%, #F8EDE8 100%);
        }
        .splash::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .15;
          background:
            radial-gradient(circle at 18% 28%, rgba(233,185,110,.85) 1px, transparent 2px),
            radial-gradient(circle at 62% 44%, rgba(232,155,175,.75) 1px, transparent 2px),
            repeating-linear-gradient(128deg, rgba(233,185,110,.14) 0px, rgba(233,185,110,.14) 1px, transparent 1px, transparent 16px);
        }
        .splashContent {
          text-align: center;
          position: relative;
          z-index: 2;
          padding: 36px 24px;
        }
        .splashTitle {
          margin: 0;
          font-family: "Playfair Display", "Cormorant Garamond", serif;
          font-size: clamp(62px, 10vw, 88px);
          line-height: 1.12;
          background: linear-gradient(135deg, #E9B96E 0%, #F4D9A0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .splashSubtitle { margin: 12px 0 0; color: #6B5A52; font-size: 17px; }
        .goldLine { width: 180px; height: 1px; margin: 18px auto 0; background: linear-gradient(90deg, transparent, #E9B96E, transparent); }

        .page { min-height: 100vh; padding: 38px 28px 56px; background: #F8F4ED; }
        .header { max-width: 1120px; margin: 0 auto 18px; }
        .title {
          margin: 0;
          font-family: "Playfair Display", "Cormorant Garamond", serif;
          font-size: 50px;
          color: #E9B96E;
        }

        .top-actions { max-width: 1120px; margin: 0 auto 20px; display: flex; gap: 12px; flex-wrap: wrap; }
        .minimal-btn {
          border: 1px solid #DCC8BE;
          background: #FFFDF8;
          color: #3F2E2A;
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: all .2s ease;
        }
        .minimal-btn:hover { border-color: #E89BAF; box-shadow: 0 0 0 3px rgba(232,155,175,.12); }

        .grid { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }

        .card {
          position: relative;
          overflow: hidden;
          background: #FFFDF8;
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 12px 28px rgba(90,64,44,.09);
          border: 1px solid rgba(233,185,110,.12);
          min-height: 132px;
          transition: box-shadow .2s ease, border-color .2s ease;
          cursor: pointer;
        }
        .card:hover {
          border-color: rgba(232,155,175,.34);
          box-shadow: 0 14px 28px rgba(90,64,44,.11);
        }

        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }

        .block-title {
          margin: 0;
          font-family: "Playfair Display", "Cormorant Garamond", serif;
          font-size: 28px;
          color: #3F2E2A;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .counter { margin: 14px 0 0; font-size: 14px; color: #6B5A52; }

        .stdIconWrap {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(145deg, #FFF7EC, #FFF1F5);
          display: grid;
          place-items: center;
          border: 1px solid rgba(233,185,110,.28);
          flex-shrink: 0;
        }
        .stdIcon { width: 24px; height: 24px; display: block; }

        .customEmojiIcon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #FFF7FB;
          border: 1px solid rgba(232,155,175,.28);
          color: #E89BAF;
          font-size: 18px;
        }

        .icon-actions { display: flex; gap: 6px; }
        .icon-btn {
          border: 1px solid #E8DCD2;
          background: #FFFDF8;
          color: #9BC4A2;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          cursor: pointer;
        }
        .icon-btn:hover { border-color: #E89BAF; color: #E89BAF; }

        .add-block-card {
          display: grid;
          place-items: center;
          color: #6B5A52;
          border: 1px dashed #DCC8BE;
          font-size: 18px;
          font-weight: 600;
        }

        .overlay { position: fixed; inset: 0; background: rgba(63,46,42,.22); display: grid; place-items: center; padding: 16px; z-index: 20; }
        .modal {
          width: min(460px, 100%);
          background: #FFFDF8;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(233,185,110,.2);
          box-shadow: 0 20px 40px rgba(63,46,42,.18);
        }
        .modal h3 { margin: 0 0 14px; color: #3F2E2A; font-family: "Playfair Display", "Cormorant Garamond", serif; }
        .field { display: grid; gap: 8px; margin-bottom: 12px; }
        .field label { color: #6B5A52; font-size: 13px; }
        .input, .select {
          width: 100%;
          border: 1px solid #E8DCD2;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          color: #3F2E2A;
          background: #FFFDF8;
        }
        .input:focus, .select:focus { border-color: #E89BAF; box-shadow: 0 0 0 3px rgba(232,155,175,.16); }

        .icons-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .icon-choice {
          border: 1px solid #E8DCD2;
          background: #FFFDF8;
          border-radius: 12px;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 20px;
        }
        .icon-choice.active { border-color: #E89BAF; background: #FFF3F6; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

        @media (max-width: 900px) {
          .grid { grid-template-columns: 1fr; }
          .title { font-size: 40px; }
        }
      `}</style>

      {showSplash ? (
        <section className="splash" onClick={() => setShowSplash(false)}>
          <div className="splashContent">
            <h1 className="splashTitle">In My Mind</h1>
            <p className="splashSubtitle">Систематизируй свои мысли без чувства вины</p>
            <div className="goldLine" />
          </div>
        </section>
      ) : (
        <main className="page">
          <header className="header">
            <h1 className="title">In My Mind</h1>
          </header>

          <section className="top-actions">
            <button className="minimal-btn" onClick={() => setIsAddItemOpen(true)}>
              + Добавить элемент
            </button>
          </section>

          <section className="grid">
            {Object.entries(data.standardBlocks).map(([key, block]) => (
              <article key={key} className="card" onClick={openSoonAlert}>
                <div className="card-top">
                  <h2 className="block-title">
                    <StandardIcon type={key} />
                    <span>{block.title}</span>
                  </h2>
                </div>
                <p className="counter">Элементов: {block.items.length}</p>
              </article>
            ))}

            {data.customBlocks.map((block) => (
              <article key={block.id} className="card" onClick={openSoonAlert}>
                <div className="card-top">
                  <h2 className="block-title">
                    <span className="customEmojiIcon">{block.icon || "✨"}</span>
                    <span>{block.title}</span>
                  </h2>
                  <div className="icon-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="icon-btn" title="Переименовать" onClick={() => { setEditingBlockId(block.id); setEditingTitle(block.title); }}>
                      ✏️
                    </button>
                    <button className="icon-btn" title="Удалить" onClick={() => deleteCustomBlock(block.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="counter">Элементов: {block.items.length}</p>
              </article>
            ))}

            <article className="card add-block-card" onClick={() => setIsAddBlockOpen(true)}>
              + Добавить блок
            </article>
          </section>
        </main>
      )}

      {isAddBlockOpen && (
        <div className="overlay" onClick={() => setIsAddBlockOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Новый блок</h3>
            <form onSubmit={addCustomBlock}>
              <div className="field">
                <label>Название</label>
                <input className="input" value={newBlockTitle} onChange={(e) => setNewBlockTitle(e.target.value)} maxLength={40} />
              </div>
              <div className="field">
                <label>Иконка</label>
                <div className="icons-row">
                  {CUSTOM_ICON_OPTIONS.map((icon) => (
                    <button type="button" key={icon} className={`icon-choice ${newBlockIcon === icon ? "active" : ""}`} onClick={() => setNewBlockIcon(icon)}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="minimal-btn" onClick={() => setIsAddBlockOpen(false)}>Отмена</button>
                <button type="submit" className="minimal-btn">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingBlockId && (
        <div className="overlay" onClick={() => setEditingBlockId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Переименовать блок</h3>
            <form onSubmit={saveEditedCustomBlock}>
              <div className="field">
                <label>Название</label>
                <input className="input" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} maxLength={40} autoFocus />
              </div>
              <div className="modal-actions">
                <button type="button" className="minimal-btn" onClick={() => setEditingBlockId(null)}>Отмена</button>
                <button type="submit" className="minimal-btn">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddItemOpen && (
        <div className="overlay" onClick={() => setIsAddItemOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Добавить элемент</h3>
            <form onSubmit={addItemToBlock}>
              <div className="field">
                <label>Блок</label>
                <select className="select" value={selectedBlockRef} onChange={(e) => setSelectedBlockRef(e.target.value)}>
                  {allBlocksForSelect.map((b) => (
                    <option key={b.ref} value={b.ref}>{b.title}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Текст</label>
                <input className="input" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} maxLength={180} />
              </div>
              <div className="modal-actions">
                <button type="button" className="minimal-btn" onClick={() => setIsAddItemOpen(false)}>Отмена</button>
                <button type="submit" className="minimal-btn">Добавить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
