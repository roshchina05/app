import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "in-my-mind-data";

const QUOTES = [
  "Мысли становятся реальностью, когда их записывают.",
  "Каждый день — новая страница твоей внутренней книги.",
  "Маленькие идеи часто приводят к большим переменам.",
  "Сохраняй то, что тронуло сердце, и возвращайся к этому.",
  "Твои желания важны. Позволь им быть увиденными.",
  "Иногда одна строка может изменить весь день.",
];

const STANDARD_BLOCKS_TEMPLATE = {
  movies: { title: "Фильмы и сериалы", icon: "🎬", items: [] },
  books: { title: "Книги", icon: "📚", items: [] },
  places: { title: "Места", icon: "📍", items: [] },
  wishlist: { title: "Вишлист", icon: "🎁", items: [] },
  thoughts: { title: "Мысли", icon: "💭", items: [] },
  ideas: { title: "Идеи", icon: "💡", items: [] },
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
  const savedStandard = safe.standardBlocks && typeof safe.standardBlocks === "object" ? safe.standardBlocks : {};
  const savedCustom = Array.isArray(safe.customBlocks) ? safe.customBlocks : [];

  const standardBlocks = {};
  Object.keys(STANDARD_BLOCKS_TEMPLATE).forEach((key) => {
    const template = STANDARD_BLOCKS_TEMPLATE[key];
    const saved = savedStandard[key];
    standardBlocks[key] = {
      title: template.title,
      icon: template.icon,
      items: Array.isArray(saved?.items) ? saved.items.filter((x) => typeof x === "string") : [],
    };
  });

  const customBlocks = savedCustom
    .filter((b) => b && typeof b === "object")
    .map((b) => ({
      id: typeof b.id === "string" ? b.id : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: typeof b.title === "string" && b.title.trim() ? b.title.trim() : "Новый блок",
      icon: typeof b.icon === "string" ? b.icon : "✨",
      items: Array.isArray(b.items) ? b.items.filter((x) => typeof x === "string") : [],
    }));

  return { standardBlocks, customBlocks };
}

export default function InMyMind() {
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

  const quoteOfDay = useMemo(() => {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }, []);

  const allBlocksForSelect = useMemo(() => {
    const standard = Object.entries(data.standardBlocks).map(([key, block]) => ({
      ref: `standard:${key}`,
      title: block.title,
      icon: block.icon,
    }));
    const custom = data.customBlocks.map((block) => ({
      ref: `custom:${block.id}`,
      title: block.title,
      icon: block.icon || "✨",
    }));
    return [...standard, ...custom];
  }, [data.standardBlocks, data.customBlocks]);

  const openSoonAlert = () => {
    alert("Скоро здесь будет список");
  };

  const addCustomBlock = (e) => {
    e.preventDefault();
    const title = newBlockTitle.trim();
    if (!title) return;

    const newBlock = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      icon: newBlockIcon || "✨",
      items: [],
    };

    setData((prev) => ({ ...prev, customBlocks: [...prev.customBlocks, newBlock] }));
    setNewBlockTitle("");
    setNewBlockIcon("✨");
    setIsAddBlockOpen(false);
  };

  const startEditCustomBlock = (block) => {
    setEditingBlockId(block.id);
    setEditingTitle(block.title);
  };

  const saveEditedCustomBlock = (e) => {
    e.preventDefault();
    const title = editingTitle.trim();
    if (!title || !editingBlockId) return;

    setData((prev) => ({
      ...prev,
      customBlocks: prev.customBlocks.map((b) => (b.id === editingBlockId ? { ...b, title } : b)),
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Inter, sans-serif;
          background: #FAF0E6;
          color: #3A2C24;
        }
        .page { min-height: 100vh; padding: 40px 28px 56px; background: #FAF0E6; }
        .header { max-width: 1100px; margin: 0 auto 24px; }
        .title {
          margin: 0;
          font-family: "Cormorant Garamond", serif;
          font-size: 48px;
          line-height: 1.1;
          color: #5C4B3A;
        }
        .quote { margin: 12px 0 0; font-size: 16px; color: #8F7A66; font-style: italic; }
        .top-actions { max-width: 1100px; margin: 0 auto 20px; display: flex; gap: 12px; flex-wrap: wrap; }
        .minimal-btn {
          border: 1px solid #D8C8B6;
          background: #fffaf6;
          color: #5C4B3A;
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .minimal-btn:hover { background: #f8eee5; transform: translateY(-1px); }
        .grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 24px rgba(92, 75, 58, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          border: 1px solid rgba(92, 75, 58, 0.05);
          min-height: 132px;
        }
        .card:hover { transform: scale(1.02); box-shadow: 0 14px 32px rgba(92, 75, 58, 0.12); }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .block-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #3A2C24;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .counter { margin: 14px 0 0; font-size: 14px; color: #B8A48F; }
        .icon-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .icon-btn {
          border: 1px solid #E6D8C9;
          background: #fffaf6;
          color: #6b5543;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          cursor: pointer;
          line-height: 1;
        }
        .add-block-card {
          display: grid;
          place-items: center;
          color: #7f6855;
          border: 1px dashed #D8C8B6;
          background: rgba(255, 255, 255, 0.7);
          font-size: 18px;
          font-weight: 600;
        }
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(58, 44, 36, 0.25);
          display: grid;
          place-items: center;
          padding: 16px;
          z-index: 20;
        }
        .modal {
          width: min(460px, 100%);
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(58, 44, 36, 0.18);
          border: 1px solid rgba(92, 75, 58, 0.1);
        }
        .modal h3 { margin: 0 0 14px; color: #3A2C24; font-size: 20px; }
        .field { display: grid; gap: 8px; margin-bottom: 12px; }
        .field label { color: #7e6957; font-size: 13px; }
        .input, .select {
          width: 100%;
          border: 1px solid #E1D3C4;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          color: #3A2C24;
          background: #fff;
        }
        .input:focus, .select:focus {
          border-color: #B8A48F;
          box-shadow: 0 0 0 3px rgba(184, 164, 143, 0.18);
        }
        .icons-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .icon-choice {
          border: 1px solid #E1D3C4;
          background: #fffaf6;
          border-radius: 12px;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 20px;
        }
        .icon-choice.active { border-color: #B8A48F; background: #f6ece2; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
        @media (max-width: 860px) {
          .grid { grid-template-columns: 1fr; }
          .title { font-size: 40px; }
        }
      `}</style>
      <main className="page">
        <header className="header">
          <h1 className="title">In My Mind</h1>
          <p className="quote">{quoteOfDay}</p>
        </header>
        <section className="top-actions">
          <button className="minimal-btn" onClick={() => setIsAddItemOpen(true)}>+ Добавить элемент</button>
        </section>
        <section className="grid">
          {Object.entries(data.standardBlocks).map(([key, block]) => (
            <article key={key} className="card" onClick={openSoonAlert}>
              <div className="card-top">
                <h2 className="block-title"><span>{block.icon}</span><span>{block.title}</span></h2>
              </div>
              <p className="counter">Элементов: {block.items.length}</p>
            </article>
          ))}
          {data.customBlocks.map((block) => (
            <article key={block.id} className="card" onClick={openSoonAlert}>
              <div className="card-top">
                <h2 className="block-title"><span>{block.icon || "✨"}</span><span>{block.title}</span></h2>
                <div className="icon-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="icon-btn" title="Переименовать" onClick={() => startEditCustomBlock(block)}>✏️</button>
                  <button className="icon-btn" title="Удалить" onClick={() => deleteCustomBlock(block.id)}>🗑️</button>
                </div>
              </div>
              <p className="counter">Элементов: {block.items.length}</p>
            </article>
          ))}
          <article className="card add-block-card" onClick={() => setIsAddBlockOpen(true)}>+ Добавить блок</article>
        </section>
      </main>
      {isAddBlockOpen && (
        <div className="overlay" onClick={() => setIsAddBlockOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Новый блок</h3>
            <form onSubmit={addCustomBlock}>
              <div className="field">
                <label>Название</label>
                <input className="input" value={newBlockTitle} onChange={(e) => setNewBlockTitle(e.target.value)} placeholder="Например, Подкасты" maxLength={40} />
              </div>
              <div className="field">
                <label>Иконка</label>
                <div className="icons-row">
                  {CUSTOM_ICON_OPTIONS.map((icon) => (
                    <button type="button" key={icon} className={`icon-choice ${newBlockIcon === icon ? "active" : ""}`} onClick={() => setNewBlockIcon(icon)}>{icon}</button>
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
                    <option key={b.ref} value={b.ref}>{b.icon} {b.title}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Текст</label>
                <input className="input" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="Введите текст..." maxLength={180} />
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
